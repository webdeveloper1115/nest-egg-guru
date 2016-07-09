var D3 = (function () {
  var free      = ['Worst', '20%', '40%', 'Median', '60%', '80%'];
  var premium   = ['Worst', '1%', '5%', '10%', '20%', '40%', 'Median', '60%', '80%'];

  var freeColor = ['#ff9572', '#d29e70', '#baa46e', '#8dad6d', '#77b16d', '#60b76b'];
  var premColor = ['#ff9572', '#e89a71', '#d29e70', '#baa46e', '#baa46e', '#8dad6d', '#77b16d', '#60b76b', '#48bc6a'];

  function horizontalBarChart(data, w, h, ls) {
    var isPremium  = data.length > 6;
    var tickHeight = isPremium? 15 : 40;
    var barHeight  = isPremium? 10 : 20;
    var percents   = isPremium? _.clone(premium).reverse() : _.clone(free).reverse();
    var colors     = isPremium? _.clone(premColor) : _.clone(freeColor);

    var width         = w || 950;
    var height        = h || 450;
    var legendSpacing = ls || 85;

    var xScale = d3.scale
                   .linear()
                   .domain([0, _.max(_.clone(data)) * 1.2])
                   .range([0, width]);

    var yScale = d3.scale
                   .linear()
                   .domain([0, percents.length])
                   .range([0, height]);

    var colorScale = d3.scale
                       .quantize()
                       .domain([0, percents.length])
                       .range(colors.reverse());

    var legendColors = d3.scale
                         .ordinal()
                         .range(_.clone(colors));

    var svg = d3.select('.bar-chart')
                .append('svg')
                .attr({
                  width: width + 100,
                  height: height + 100
                });

    var border = svg.append('rect')
                    .attr({
                      width: width,
                      height: height
                    })
                    .style({
                      fill: 'transparent',
                      stroke: 'black'
                    })
                    .attr('transform', 'translate(80, 0)');

    var xAxis = d3.svg
                  .axis()
                  .orient('bottom')
                  .scale(xScale)
                  .outerTickSize(0)
                  .innerTickSize(-height)
                  .tickPadding(10)
                  .ticks(11)
                  .tickFormat(function(d, i) {
                    return '$' + numberWithCommas(d);
                  });

    var yAxis = d3.svg
                  .axis()
                  .orient('left')
                  .scale(yScale)
                  .outerTickSize(0)
                  .innerTickSize(-width)
                  .tickFormat(function(d, i) {
                    return percents[i];
                  })
                  .tickPadding(15)
                  .tickValues(d3.range(percents.length));

    var y_axis = svg.append('g')
                    .attr('transform', 'translate(80, 0)')
                    .attr('id', 'yaxis')
                    .call(yAxis)
                    .selectAll('text')
                      .attr('y', tickHeight);

    var x_axis = svg.append('g')
                    .attr('transform', 'translate(135, '+height+')')
                    .attr('id', 'xaxis')
                    .call(xAxis)
                    .selectAll('text')
                      .attr('transform', 'rotate(-40) translate(-70, -20)')
                      .style('font-size', '10px');

    var chart = svg.append('g')
                    .attr('transform', 'translate(80, '+ barHeight +')')
                    .attr('class', 'bar')
                    .selectAll('rect')
                    .data(data.reverse())
                    .enter()
                    .append('rect')
                    .attr('height', barHeight)
                    .attr({
                      x: 0,
                      y: function(d, i) {
                        return yScale(i);
                      }
                    })
                    .style('fill', function(d, i) {
                      return colorScale(i);
                    })
                    .attr('width', function(d) {
                      return xScale(d);
                    });

    var transitext = d3.select('.bar')
                       .selectAll('text')
                       .data(data)
                       .enter()
                       .append('text')
                       .attr({
                         x: function(d) {
                           return xScale(d) + 10;
                         },
                         y: function(d, i) {
                           return yScale(i) + (barHeight - 5);
                         }
                       })
                       .text(function(d) {
                         return '$' + numberWithCommas(d);
                       })
                       .style({
                         'fill': '6D777D',
                         'font-size': '10px'
                       });

      var legend = d3.select('.horizontal-bar')
                   .append('svg')
                   .attr({
                     width: width + 100,
                     height: 40
                   })
                   .selectAll('.legend')
                   .data(_.clone(percents))
                   .enter()
                   .append('g')
                   .attr('class', 'legend')
                   .attr('transform', function(d, i) {
                     return 'translate('+ -(i * legendSpacing) +', 0)';
                  });

              legend.append('circle')
                    .attr('r', '8')
                    .attr('cy', '10')
                    .attr('cx', width + 15)
                    .style('fill', legendColors);

              legend.append('text')
                    .attr('x', width + 5)
                    .attr('y', 9)
                    .attr('dy', '.35em')
                    .style('text-anchor', 'end')
                    .style('font-size', "10px")
                    .text(function(d) {
                      return d;
                    });
  }// horizontalBarChart

  function verticalBarChart(data, w, h, ls, yearsInput) {
    var getNames   = _.pluck(_.pluck(data, 'values')[0], 'name');
    var isPremium  = getNames.length > 6;

    var colorRange = isPremium? _.clone(premColor) : _.clone(freeColor);
    var names      = isPremium? getNames : getNames;
    var labels     = isPremium? _.clone(premium) : _.clone(free);

    var width         = w || 900;
    var height        = h || 450;
    var legendSpacing = ls || 85;
    var tickSpacing;
    
    switch(yearsInput) {
      case 1: tickSpacing = 450;
      break;
      case 2: tickSpacing = 225;
      break;
      case 3: tickSpacing = 150;
      break;
      case 4: tickSpacing = 115;
      break;
      case 5: tickSpacing = 93;
      break;
      case 6: tickSpacing = 80;
      break;
      case 7: tickSpacing = 70;
      break;
      case 8: tickSpacing = 60;
      break;
      case 9: tickSpacing = 55;
      break;
      default: tickSpacing = 50;
      break;
    }

    var colors = d3.scale
                   .ordinal()
                   .range(colorRange);

    var legendColors = d3.scale
                         .ordinal()
                         .range(_.clone(colorRange).reverse());

    var xScale = d3.scale
                   .ordinal()
                   .domain(data.map(function(d) {
                     return d.year;
                   }))
                   .rangeRoundBands([0, width], .1);

    var xScale2 = d3.scale
                    .ordinal()
                    .domain(names)
                    .rangeRoundBands([0, xScale.rangeBand()]);

    var yScale = d3.scale
                   .linear()
                   .range([height, 0])
                   .domain([0, d3.max(data, function(d) {
                     return d3.max(d.values, function(obj) {
                       return obj.value;
                     });
                   })]);

    var xAxis = d3.svg
                  .axis()
                  .scale(xScale)
                  .orient('bottom')
                  .outerTickSize(0)
                  .innerTickSize(-height)
                  .tickPadding(30)
                  .ticks(names.length)
                  .tickFormat(function(d, i) {
                    return d;
                  });

    var yAxis = d3.svg
                  .axis()
                  .scale(yScale)
                  .orient('left')
                  .innerTickSize(-width)
                  .tickPadding(10)
                  .tickFormat(function(d) {
                    return '$'+numberWithCommas(d);
                  });

    var svg = d3.select('.vertical-bar-chart')
                .append('svg')
                .attr({
                  width: width + 100,
                  height: height + 120
                })
                .append('g');

    var border = svg.append('rect')
                    .attr({
                      width: width,
                      height: height
                    })
                    .style({
                      'fill': 'transparent',
                      'stroke': 'black'
                    })
                    .attr('transform', 'translate(100, 0)');

    var x_axis = svg.append('g')
                    .attr('transform', 'translate(100,' + height + ')')
                    .attr('class', 'xaxis')
                    .call(xAxis)
                    .selectAll('line')
                    .attr('transform', 'translate('+ tickSpacing +', 0)');

    var y_axis = svg.append('g')
                    .attr('transform', 'translate(100, 0)')
                    .attr('class', 'yaxis')
                    .call(yAxis)
                    .append('text')
                    .attr('y', 6);

    var years = svg.selectAll('.year')
                   .data(data)
                   .enter()
                   .append('g')
                   .attr('class', 'year')
                   .attr('transform', function(d) {
                     return 'translate(' + (xScale(d.year) + 107) + ',0)';
                   });

    var chart = years.selectAll('rect')
                      .data(function(d) {
                        return d.values;
                      })
                      .enter()
                      .append('rect')
                      .attr('width', xScale2.rangeBand() - 3)
                      .attr('x', function(d) {
                        return xScale2(d.name);
                      })
                      .attr('y', function(d) {
                        return yScale(d.value);
                      })
                      .attr('height', function(d) {
                        return height - yScale(d.value);
                      })
                      .style('fill', function(d) {
                        return colors(d.name);
                      });

    var legend = d3.select('.vertical-bar')
                   .append('svg')
                   .attr({
                     width: width + 100,
                     height: 30
                   })
                   .selectAll('.legend')
                   .data(_.clone(labels).reverse())
                   .enter()
                   .append('g')
                   .attr('class', 'legend')
                   .attr('transform', function(d, i) {
                     return 'translate('+ -(i * legendSpacing) +', 0)';
                  });

              legend.append('circle')
                    .attr('r', '8')
                    .attr('cy', '10')
                    .attr('cx', width + 15)
                    .style('fill', legendColors);

              legend.append('text')
                    .attr('x', width)
                    .attr('y', 9)
                    .attr('dy', '.35em')
                    .style('text-anchor', 'end')
                    .style('font-size', "10px")
                    .text(function(d) {
                      return d;
                    });
  } // verticalBarChart

  function lineChart(data, w, h, ls, p) {
    var isPremium  = data.length > 6;
    var percents   = isPremium? _.clone(premium) : _.clone(free);
    var colors     = isPremium? _.clone(premColor) : _.clone(freeColor);

    var width         = w || 900;
    var height        = h || 450;
    var legendSpacing = ls || 85;
    var padding       = p || 0;

    var legendColors = d3.scale
                         .ordinal()
                         .range(_.clone(colors).reverse());
    var xScale = d3.scale
                   .linear()
                   .domain([0, percents.length])
                   .range([0, width]);

    var yScale = d3.scale
                   .linear()
                   .domain([0, _.max(_.clone(data)) * 1.3])
                   .range([height+20, 0]);

    var xAxis = d3.svg
                  .axis()
                  .scale(xScale)
                  .orient('bottom')
                  .outerTickSize(0)
                  .innerTickSize(-height)
                  .tickPadding(15)
                  .ticks(percents.length)
                  .tickFormat(function(d, i) {
                    return percents[i];
                  });

    var yAxis = d3.svg
                  .axis()
                  .scale(yScale)
                  .orient('left')
                  .outerTickSize(0)
                  .innerTickSize(-width)
                  .tickPadding(15)
                  .ticks(data.length)
                  .tickFormat(function(d, i) {
                    return '$' + numberWithCommas(d);
                  });

    var line = d3.svg
                 .area()
                 .x(function(d, i) {
                   return xScale(i);
                 })
                 .y0(height)
                 .y1(function(d) {
                   return yScale(d);
                 });

    var svg = d3.select('.line-chart')
                .append('svg')
                .attr({
                  width: width + 100 + padding,
                  height: height + 100
                })
                .append('g')
                .attr('transform', 'translate(20,0)');

    var border = svg.append('rect')
                    .attr({
                      width: width + padding,
                      height: height
                    })
                    .style({
                      'fill': 'transparent',
                      'stroke': 'black'
                    })
                    .attr('transform', 'translate(80, 20)');

    var y_axis = svg.append('g')
                    .attr('transform', 'translate(80, 0)')
                    .attr('class', 'yaxis')
                    .call(yAxis);

    var x_axis = svg.append('g')
                    .attr('transform', 'translate(120,'+ (height+20) +')')
                    .attr('class', 'xaxis')
                    .call(xAxis)

    var gradient = svg.append('linearGradient')
                      .attr('id', 'area-gradient')
                      .attr('gradientUnits', 'userSpaceOnUse')
                      .attr('x1', 0)
                      .attr('y1', yScale(0))
                      .attr('x2', xScale(percents.length))
                      .attr('y2', 0)
                      .selectAll('stop')
                        .data([
                          { offset: '0%', color: '#EE8E6A' },
                          { offset: '1%', color: '#E49369' },
                          { offset: '10%', color: '#CD9968' },
                          { offset: '20%', color: '#B59F67' },
                          { offset: '30%', color: '#9EA566' },
                          { offset: '40%', color: '#87AA66' },
                          { offset: '50%', color: '#71AF65' },
                          { offset: '60%', color: '#5BB564' },
                          { offset: '80%', color: '#46BB63' },

                        ])
                        .enter()
                        .append('stop')
                          .attr('offset', function(d) {
                            return d.offset;
                          })
                          .attr('stop-color', function(d) {
                            return d.color;
                          });

    var chart = svg.append('path')
                   .attr('transform', 'translate(120, 20)')
                   .datum(data.reverse())
                   .attr('class', 'line')
                   .attr('d', line)
                   .style('fill', "url(#area-gradient)");

    var points = svg.selectAll('.point')
                        .data(data)
                        .enter()
                        .append('g')
                        .classed('point', true)
                        .attr('transform', function(d, i) {
                          return 'translate('+ (xScale(i) + 120 ) +','+ yScale(d) +' )';
                        });

    var circles = points.append('circle')
                        .attr('r', '3')
                        .attr('cy', '20');

    var transitext = points.append('text')
                           .text(function(d) {
                             return '$' + numberWithCommas(d);
                           })
                           .attr('text-anchor', 'middle');

    var legend = d3.select('.line-graph')
                   .append('svg')
                   .attr({
                     width: width + 100,
                     height: 40
                   })
                   .selectAll('.legend')
                   .data(_.clone(percents).reverse())
                   .enter()
                   .append('g')
                   .attr('class', 'legend')
                   .attr('transform', function(d, i) {
                     return 'translate('+ -(i * legendSpacing) +', 0)';
                  });

            legend.append('circle')
                    .attr('r', '8')
                    .attr('cy', '10')
                    .attr('cx', width + 15)
                    .style('fill', legendColors);

            legend.append('text')
                  .attr('x', width + 5)
                  .attr('y', 9)
                  .attr('dy', '.35em')
                  .style('text-anchor', 'end')
                  .style('font-size', "10px")
                  .text(function(d) {
                    return d;
                  });
  }// lineChart

  function pieChart(data, target) {
    var width  = 260;
    var height = 260;
    var radius = Math.min(width, height) / 2;

    var color = d3.scale
                  .ordinal()
                  .range(['#5ECF80', '#4A90E2', '#FF9572']);

    var pie = d3.layout
                .pie()
                .sort(null);

    var arc = d3.svg
                .arc()
                .innerRadius(radius - 80)
                .outerRadius(radius - 50);

    var svg = d3.select('.'+target)
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('viewBox', '0 0 ' + width + ' ' + height)
                .attr('preserveAspectRatio', 'xMidYMid')
                .append('g')
                .attr('transform', 'translate('+ width / 2 +','+ height / 3 +')');

    var path = svg.selectAll('path')
                  .data(pie(data))
                  .enter()
                  .append('path')
                  .attr('fill', function(d, i) {
                     return color(i);
                  })
                  .attr('d', arc);
  }// pieChart

  return {
    horizontal: horizontalBarChart,
    vertical: verticalBarChart,
    line: lineChart,
    pie: pieChart
  };

})();