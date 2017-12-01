
        //set the dimensions and margins of the graph
        var margin = {top: 10, right: 20, bottom: 50, left: 50},
            line_width = 460 - margin.left - margin.right,
            line_height = 300 - margin.top - margin.bottom;

// set the ranges
        var x = d3.scaleLinear().range([0, line_width]);
        var y = d3.scaleLinear().range([line_height, 0]);
        var parseTime = d3.timeParse("%m-%d");

// define the line
        var max = d3.line()
            .x(function (d) {
                return x(d.date4);
            })
            .y(function (d) {
                return y(d.TMAX);
            });

        var min = d3.line()
            .x(function (d) {
                return x(d.date4);
            })
            .y(function (d) {
                return y(d.TMIN);
            });

        var avg = d3.line()
            .x(function (d) {
                return x(d.date4);
            })
            .y(function (d) {
                return y(d.TAVG);
            });

        var svg_line = d3.select("#Map").append("svg")
            .attr("width", line_width + margin.left + margin.right)
            .attr("height", line_height + margin.top + margin.bottom)
            .attr("x",700)
            .attr("y",500)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var barchart = d3.select("#Map").append("svg")
            .attr("width", line_width + margin.left + margin.right)
            .attr("height", line_height + margin.top + margin.bottom)
            .attr("x",0)
            .attr("y",500)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        let svg = d3.select("svg");
        let width = parseInt(svg.attr("width"));
        let height = parseInt(svg.attr("height"));
        let projection = d3.geoAlbersUsa()
            .translate([width / 2, height / 2-250])
            .scale([800]);
        let path = d3.geoPath().projection(projection);
        // Load in GeoJSON data
        d3.csv("states_name.csv", function (error, name) {
            if (error) throw error;
        d3.json("us-states.json", function (json) {
            d3.select("#mapLayer").selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("fill", "#ADD8E6")
                .on('mouseover', function (d) {
                d3.select(this).classed('hidden',false).style("fill","orange");
                })
                .on('mouseout',function(d){
                    d3.select(this).style("fill", "#ADD8E6");
                });
        svg.selectAll("text")
        .data(json.features)
        .enter()
        .append("svg:text")
        .text(function(d){
            name.forEach(function(element){
                if (d.properties.name == element.State)
                    id = element.Abbreviation;
                    });
            return id;
            })
        .attr("x", function(d){
            return path.centroid(d)[0];
            })
        .attr("y", function(d){
            return  path.centroid(d)[1];
            })
        .attr("text-anchor","middle")
        .attr('font-size','5pt');

            });

    });
         
        var tooltip = d3.select('body').append('div')
            .attr('class', 'hidden tooltip');

        d3.csv("data.csv", function (data) {
            d3.select("#cityLayer").selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return projection([d.LONGITUDE, d.LATITUDE])[0];
                })
                .attr("cy", function (d) {
                    return projection([d.LONGITUDE, d.LATITUDE])[1];
                })
                .attr("r", 3)
                .attr( "fill", "#900" )
                .attr( "stroke", "black" )
                .style("opacity", 0.8)
                .on('mousemove', function (d) {

                    var mouse = d3.mouse(svg.node()).map(function (d) {
                        return parseInt(d);
                    })
                    tooltip.classed('hidden', false)
                        .attr('style', 'left:' + (mouse[0] + 15) +
                            'px; top:' + (mouse[1] - 35) + 'px')
                        .html(d.STATION_NAME);
                })
                .on('mouseout', function () {
                    tooltip.classed('hidden', true);
                })
                .on("click", function (d) {
                    var l = "";
                    var data_list = [];
                    data.forEach(function (element) {
                        if (element.STATION_NAME == d.STATION_NAME)
                            data_list.push(element);
                    });
                    // append the svg obgect to the body of the page
                    // appends a 'group' element to 'svg'
                    // moves the 'group' element to the top left margin
                    line_chart(l,data_list);
                    bar_chart(data_list);
                    temp_slider(data_list);
                    //var animal_data;
                    d3.csv("Animal1_modified2.csv", function (error, animal_data) {
                        if (error) throw error;
                        animal_new(data_list, animal_data);
                        //animal(data_list, animal_data);
                        skipic();
                        //animallist(data_list, animal_data);
                    });

                });
        });


        function line_chart(l,data_list) {
            data_list.forEach(function (d, i) {
                if (d.STATION_NAME === "TAO NM US") {
                    d.push(d);

                }
            });

            data_list.forEach(function (d) {
                d.TMAX = +d["DLY-TMAX-NORMAL"]+l;
                d.TMIN = +d["DLY-TMIN-NORMAL"]+l;
                d.TAVG = +d["DLY-TAVG-NORMAL"]+l;
                d.date = d.DATE.slice(0, -2);
                d.date = +d.date.slice(4);

                d.date2 = +d.DATE.slice(6);
                d.date3 = d.date + "-" +d.date2;
                d.date = (d.date-1)*30 +d.date2;
                d.date4 =parseTime(d.date3);

                //var parseDate = d3.time.format("%d-%b-%y").parse;
                //d.date2 = d.date2.slice(2);
            });

            // Scale the range of the data
            x.domain(d3.extent(data_list, function(d) { return d.date4; }));
            y.domain([-20, d3.max(data_list, function (d) {
                return d.TMAX;
            })]);

            var line = svg_line.selectAll("path")
                .remove().exit()
                .data([data_list]);

            line.enter().append("path")
                .attr("class", "hot")
                .attr("d", max);

            line.enter().append("path")
                .attr("class", "cold")
                .attr("d", min);

            line.enter().append("path")
                .attr("class", "avg")
                .attr("d", avg);

            // Add the X Axis
            line = svg_line.selectAll("g")
                .remove().exit()
                .data([data_list]);

            line.enter().append("g")
                .attr("transform", "translate(0," + line_height + ")")
                .call(d3.axisBottom(x)
                    .tickFormat(d3.timeFormat("%m-%d")))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            // Add the Y Axis
            line.enter().append("g")
                .call(d3.axisLeft(y));

            line = svg_line.selectAll("line")
                .remove().exit()
                .data([data_list]);

            line.enter().append("line")
                .attr("x1", 0)
                .attr("x2", line_width)
                .attr("y1", y(32))
                .attr("y2", y(32))
                .attr("class", "freeze");


        }

        //======================================================================================================================
        function bar_chart(data_list) {

            data_list.forEach(function (d) {

                d.TMAX = +d["DLY-TMAX-NORMAL"];
                d.TMIN = +d["DLY-TMIN-NORMAL"];
                d.TAVG = +d["DLY-TAVG-NORMAL"];
                d.TSNOW = +d["YTD-SNOW-NORMAL"];
                d.date = d.DATE.slice(0, -2);
                d.date = +d.date.slice(4);

                d.date2 = +d.DATE.slice(6);
                d.date3 = d.date + "-" +d.date2;
                d.date = (d.date-1)*30 +d.date2;
                d.date4 =parseTime(d.date3);

            });

            // Scale the range of the data
            x.domain(d3.extent(data_list, function(d) { return d.date4; }));
            y.domain([0, d3.max(data_list, function (d) {
                return d.TSNOW;
            })]);


            var colorScale = d3.scaleSequential(d3.interpolateBlues)
                .domain([0,  d3.max(data_list, function (d) {
                    return d["DLY-SNOW-PCTALL-GE100TI"]})]);

            var Bar = barchart.selectAll("rect")
                .remove().exit()
                .data(data_list);
            Bar.enter().append("rect")
                //.attr("class", "snow")
                .attr("x", function (d, i) {
                    return line_width - x(d.date4)
                })
                .attr("y", function (d) {
                    return line_height - y(d.TSNOW)
                })
                .attr("height", function (d, i) {
                    return y(d.TSNOW)
                })
                .attr("width", function (d, i) {
                    return (line_width) / 365
                })
                .style("fill", function(d, i ) { return colorScale(d["DLY-SNOW-PCTALL-GE100TI"]); });


            // Add the X Axis
            bar = barchart.selectAll("g")
                .remove().exit()
                .data([data_list]);

            barchart.append("g")
                .attr("transform", "translate(0," + line_height + ")")
                .call(d3.axisBottom(x)
                    .tickFormat(d3.timeFormat("%m-%d")))
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-65)");

            // Add the Y Axis
            barchart.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y));

            barchart.append("text")
                .attr("x", line_width/2)
                .attr("y",0)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text("Snow Totals");

            svg_line.append("text")
                .attr("x", line_width/2)
                .attr("y",-10)
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text("Temperature High/Averge/Low");

        }
//======================================================================================================================

        function animal_new(data_list, animal_data){
            var station_name = data_list[0].STATION_NAME;
            var station_state = station_name.split(" ");
            //var state = station_name[-2];
            //console.log("state is :", State);
            var state = station_state[station_state.length -2];
            var state_mark;
            name.forEach(function(element){
                if (element.Abbreviation == state)
                    state_mark = element.State;
            });

            var full_name = state_mark;
            d3.json("us-states.json", function (json) {
            d3.select("#mapLayer").selectAll("path")
                .data(json.features)
                .attr("fill", function(d){
                    if(d.properties.name == full_name)
                    {
                        return d3.select(this).style("fill","green");
                    }
                });
               }); 
           
            var animal_list =[];
            animal_data.forEach(function(element){
            var initialString = element.States;
            var statelist = initialString .split(",");
            animal_list.push({"Common_Name": element.Name, "Image": element.Image , "Description": element.Description, "States_Found": statelist });
            
            });
            //console.log(animal_list);
            animal_pic(full_name, animal_list);

        }


        function animal_pic(state, animal_list) {
            /* if((data_list.STATION_NAME=="SILVER LAKE BRIGHTON UT US")||(data_list.STATION_NAME=="PINEVIEW DAM UT US")) */
            //console.log(state);
            //console.log("length", animal_list.length, animal_list[0]);
            var name;
            for ( var i = 0; i< animal_list.length; i++)
            {
                if (animal_list[i].States_Found.indexOf(state) > -1) 
                            {
                                //console.log(animal_list[i].Common_Name,element.Image);
                                //return element.Common_Name,element.Image;
                                name = animal_list[i].Common_Name;
                                console.log(name);
                                break;
                            }
            }            
            var image;
            //console.log("---------",image);
            var svg2 = d3.select("#Map");
            var g = svg2.append("g");
            var img = g.append("svg:image")
                .attr("width", 200)
                .attr("height", 400)
                .attr("x", 0)
                .attr("y", 0)
                .attr("xlink:href", function(d){       
                        if(name == "Snowshoe hare")
                        {
                          return "Snowshoe_hare.png";
                        }
                        else if(name == "American pika")
                        {
                           return image = "American_pika.png";
                        }
                        else if(name == "Reindeer")
                        {
                           return image == "Reindeer.png";
                        }
                        else if(name == "Brown Bear")
                        {    
                           return image = "Brown_Bear.png";
                        }
                        else if(name == "Canadian lynx")
                        {    
                           return image = "Canadian_lynx.png";
                        }
                        else if(name == "Wolverine")
                        {
                          return  image = "Wolverine.png";
                        }    
                        else if(name == "American Beaver")
                        {
                          return  image = "American_Beaver.png";
                        }
                        else if(name == "Puma")
                        {
                          return  image = "Puma.png";
                        }
                        else if(name == "Yellow-bellied Marmot")
                        {
                          return  image = "Yellow-bellied_Marmot.png";
                        }
                        else if(name == "Mule Deer")
                        {
                           return image = "Mule_Deer.png";
                        }
                        else if(name == "American Jackal")
                        {
                           return image = "American_Jackal.png";
                        }
                        else if(name == "American Black Bear")
                        {
                           return image = "American_Black_Bear.jpg";
                        }
                        else if(name == "Mountain Sheep")
                        {
                           return image = "Mountain_Sheep.jpg";
                        }

                });
    
            } 
           

        function skipic(data_list, animal_data) {

            /* if((data_list.STATION_NAME=="SILVER LAKE BRIGHTON UT US")||(data_list.STATION_NAME=="PINEVIEW DAM UT US")) */
            var svg2 = d3.select("#Map");
            var g = svg2.append("g");
            var img = g.append("svg:image")
                .attr("xlink:href", "Jackson.jpeg")
                .attr("width", 300)
                .attr("height", 300)
                .attr("x", 900)
                .attr("y", 0);
        }

        function temp_slider(data_list){

            var svg = d3.select("#Map");
                margin = {right: 50, left: 50},
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height");

            var x = d3.scaleLinear()
                .domain([-10, 10])
                .range([0, width])
                .clamp(true);

            var slider = svg.append("g")
                .attr("class", "slider")
                .attr("transform", "translate(" + margin.left + "," + height * 7 / 8 + ")");

            slider.append("line")
                .attr("class", "track")
                .attr("x1", x.range()[0])
                .attr("x2", x.range()[1])
                .select(function () {
                    return this.parentNode.appendChild(this.cloneNode(true));
                })
                .attr("class", "track-inset")
                .select(function () {
                    return this.parentNode.appendChild(this.cloneNode(true));
                })
                .attr("class", "track-overlay")
                .call(d3.drag()
                    .on("start.interrupt", function () {
                        slider.interrupt();
                    })
                    .on("start drag", function () {
                        hue(x.invert(d3.event.x));

                    }));

            slider.insert("g", ".track-overlay")
                .attr("class", "ticks")
                .attr("transform", "translate(0," + 18 + ")")
                .selectAll("text")
                .data(x.ticks(10))
                .enter().append("text")
                .attr("x", x)
                .attr("text-anchor", "middle")
                .text(function (d) {
                    return d + "°";
                });

            var handle = slider.insert("circle", ".track-overlay")
                .attr("class", "handle")
                .attr("r", 9);

            slider.transition() // Gratuitous intro!
                .duration(750)
                .tween("hue", function () {
                    var i = d3.interpolate(0, 7);
                    return function (t) {
                        hue(i(t));
                    };
                });

            function hue(h) {
                handle.attr("cx", x(h));
                svg.style("background-color", d3.hsl(h * 15, .7, .7));
            } 
        }

