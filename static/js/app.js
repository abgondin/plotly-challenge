// Step 1: Plotly
// Create a function to build the charts
function buildCharts(id) {
    // Use the D3 library to read in samples.json
    d3.json("data/samples.json").then(data => {
        console.log(data)
        var sample = data.samples.filter(subjectID => subjectID.id === id)[0];
        console.log(sample)
        // Grab values from the data json object to build the plots
        // Use sample_values as the values for the bar chart.
        var values = sample.sample_values;
        // Use otu_ids as the labels for the bar chart.
        var labels = sample.otu_ids;
        // Use otu_labels as the hovertext for the chart.
        var hoverText = sample.otu_labels;

        // Create a horizontal bar chart with a dropdown menu to display the top 10 OTUs found in that individual.
        var barData = [
            {
                y: labels.slice(0, 10).map(otuID => `OTU ${otuID}`).reverse(),
                x: values.slice(0, 10).reverse(),
                text: hoverText.slice(0, 10).reverse(),
                type: "bar",
                orientation: "h"
            }];

        var barLayout = {
            title: "Top 10 Bacteria Cultures Found",
            margin: { t: 30, l: 150 }
        };

        Plotly.newPlot("bar", barData, barLayout);

        // Create a bubble chart that displays each sample.
        var bubbleData = [
            {
                // Use otu_ids for the x values.
                x: labels,
                // Use sample_values for the y values.
                y: values,
                // Use otu_labels for the text values.
                text: hoverText,
                mode: "markers",
                marker: {
                    // Use otu_ids for the marker colors.
                    color: labels,
                    // Use sample_values for the marker size.
                    size: values,
                }
            }];

        var bubbleLayout = {
            margin: { t: 0 },
            xaxis: { title: "OTU ID" },
            hovermode: "closest",
        };

        Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    });
}

// Display the sample metadata, i.e., an individual's demographic information.
// Display each key-value pair from the metadata JSON object somewhere on the page.
function buildMetadata(id) {
    // read the json file to get data
    d3.json("data/samples.json").then(data => {
        // get the metadata info for the demographic panel
        var metadata = data.metadata;
        console.log(metadata)
        // filter meta data info by id
        var sampleMetadata = metadata.filter(meta => meta.id.toString() === id)[0];
        console.log(sampleMetadata)
        // select demographic panel to put data
        var panel = d3.select("#sample-metadata");
        // empty the demographic panel each time before getting new id info
        panel.html("");
        // grab the necessary demographic data data for the id and append the info to the panel
        Object.entries(sampleMetadata).forEach(([key, value]) => {
            panel.append("h6").text(`${key}: ${value}`);
        });
    });
}

// BONUS
// Plot the weekly washing frequency of the id in a Gauge Chart.
// Account for values ranging from 0 through 9.
// Update the chart whenever a new sample is selected.

// Color palette for Gauge Chart
var arrColorsG = ["#264D00", "#404D00", "#6A8000", "#7a9400", "#999900", "#CCCC00", "#FFDD33", "FFF2B3", "#FFFBE6", "white"];

function buildGaugeChart(id) {
    console.log("id", id);

    d3.json("data/samples.json").then(data => {

        var sample = data.metadata.filter(sampleData =>
            sampleData["id"] === parseInt(id));

        gaugeChart(sample[0]);
    });
}

function gaugeChart(data) {

    if (data.wfreq === null) {
        data.wfreq = 0;

    }

    let degree = parseInt(data.wfreq) * (180 / 10);

    // Trig to calc meter point
    let degrees = 180 - degree;
    let radius = .5;
    let radians = degrees * Math.PI / 180;
    let x = radius * Math.cos(radians);
    let y = radius * Math.sin(radians);

    let mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    let path = mainPath.concat(pathX, space, pathY, pathEnd);

    // Ball of the wash freq pointer
    let trace = [{
        type: 'scatter',
        x: [0], y: [0],
        marker: { size: 50, color: '#AF002A' },
        showlegend: false,
        name: 'WASH FREQ',
        text: data.wfreq,
        hoverinfo: 'text+name'
    },
    {
        values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 9],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition: 'inside',
        textfont: {
            size: 16,
        },
        marker: { colors: [...arrColorsG] },
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '2-1', '0-1', ''],
        hoverinfo: 'text',
        hole: .5,
        type: 'pie',
        showlegend: false
    }];
    // Arrow of the wash freq pointer
    let layout = {
        shapes: [{
            type: 'path',
            path: path,
            fillcolor: '#AF002A',
            line: {
                color: '#AF002A'
            }
        }],

        title: '<b>Belly Button Washing Frequency</b> <br> <b>Scrub Per Week</b>',
        height: 550,
        width: 550,
        xaxis: {
            zeroline: false, showticklabels: false,
            showgrid: false, range: [-1, 1]
        },
        yaxis: {
            zeroline: false, showticklabels: false,
            showgrid: false, range: [-1, 1]
        },
    };

    Plotly.newPlot('gauge', trace, layout, { responsive: true });

}

// Set up default plots and update all of the plots any time that a new sample is selected.
function init() {
    // Grab a reference to the dropdown select element
    var dropdown = d3.select("#selDataset");

    // Use the list of sample names to populate the select options
    d3.json("data/samples.json").then(data => {
        data.names.forEach(id => {
            dropdown
                .append("option")
                .text(id)
                .property("value", id);
        });

        // Use the first sample from the list to build the initial plots
        buildCharts(data.names[0]);
        buildMetadata(data.names[0]);
        buildGaugeChart(data.names[0])
    });
}

function optionChanged(newId) {
    // Fetch new data each time a new sample is selected
    buildCharts(newId);
    buildMetadata(newId);
    buildGaugeChart(newId)
}

// Initialize the dashboard
init();


