/**
 * 
 */
function Environment(settings) {
    this.apiVals = {
           api_key   : 'HJP6EDFXAZGDISCXQ',
           genreUrl  : 'http://developer.echonest.com/api/v4/genre/',
           songUrl   : 'http://developer.echonest.com/api/v4/song/'
    };
    
    this.ui = new UiManager(this);
    
};

Environment.prototype.testPrototype = function (msg){
    alert(msg);
};

Environment.prototype.setup = function () {
    //this.testPrototype("Environment created");
    //this.ui.testFunction();
    this.ui.bindEvents();
    this.populateGenres();
};

// Retrieve the Echo Nest list of genres
Environment.prototype.populateGenres = function() {
    var options = $("#genreSelect");
    var params = this.apiVals;
    $.getJSON(params.genreUrl + 'list', {
        api_key: params.api_key,
        format:  'json',
    })
      .done(function(data) {
         var genres = (data.response.genres);
         $.each( genres, function( i, item ) {
             options.append($("<option />").val(item.name).text(item.name));
         });
    });
};

// Get list of top artists by hotttnesss for given genre
Environment.prototype.getArtistsByGenre = function(name, num) {
    var self = this;
    var params = self.apiVals;
    
    $.getJSON(params.genreUrl + 'artists', { 
        api_key : params.api_key,
        format : 'json',
        name   : name,
        bucket : 'hotttnesss',
        results: num
    }, function(data) {
         var series = [{
             name: 'Artist by hotttnesss',
             colorByPoint: true,
             data: []
         }];
         var vals = [];
         $.each( data.response.artists, function( i, item ) {
             vals[i] = {
                     name: item.name,
                     y: item.hotttnesss,
                     drilldown: true
             };     
         });
         series[0].data = vals;
         self.drawTopArtistChart(name, series);
    });    
};

Environment.prototype.getSongsByArtist = function(name, chart) {
    var self = this;
    var params = self.apiVals;
    chart.showLoading('Fetching artist data...');
    $.getJSON(params.songUrl + 'search', { 
        api_key : params.api_key,
        format  : 'json',
        bucket  : 'song_hotttnesss',
        artist  : name,
        results : 10
    }, function(result) {
         var data = [];
         var series;
         $.each( result.response.songs, function( i, item ) {
             data[i] = [item.title, item.song_hotttnesss];
         });
         series = {
                 name : name + ' top songs',
                 data : data,
                 events : {
                     click : null
                 }
         };
         chart.hideLoading();
         self.swapSeries(chart, series);
     });    
    
};

Environment.prototype.swapSeries = function (chart, series) {
    chart.series[0].remove(false);
//    console.log(series);
    chart.addSeries(series);
    chart.xAxis[0].setTitle({
        text: 'Song'
    });
    chart.setTitle({
        text: series.name
    });
};

Environment.prototype.drawTopArtistChart = function(genre, series) {
    var self = this;
    $('#chartDiv').highcharts({
        plotOptions : {
            series : {
                events: {
                    click: function (e) {                   
                        var chart = this.chart;
                        if (!e.seriesOptions) {
                            self.getSongsByArtist(e.point.name, chart);
                        }
                    }
                }
            }
        },
        chart : {
            type : 'column',
        },
        title : {
            text : 'Top ' + series[0].data.length + ' ' + genre + ' artists'
        },
        xAxis : {
            type : 'category',
            title : {
                text: 'Artist'
            }
        },
        yAxis : {
            title : {
                text : 'Hotttnesss score'
            }
        },
        series : series,
        legend : {
            enabled : false
        },
        tooltip : {
            formatter : function() {
                return '<b>' + this.key +': </b>' + this.y;
            }
        },
        drilldown: {
            series: []
        }
    });
};