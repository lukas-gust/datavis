loadData().then(data => {

    // no country selected by default
    this.activeCountry = null;
    // deafultActiveYear is 2000
    this.activeYear = '2000';
    let that = this;

    // ******* TODO: PART 3 *******
    /**
     * Calls the functions of the views that need to react to a newly selected/highlighted country
     *
     * @param countryID the ID object for the newly selected country
     */
    function updateCountry(countryID) {
        that.activeCountry = countryID;

        worldMap.updateHighlightClick(countryID)
        gapPlot.updateHighlightClick(countryID)
        infoBox.updateTextDescription(that.activeCountry, that.activeYear)

        //TODO - Your code goes here - 

    }

    // ******* TODO: PART 3 *******

    /**
     *  Takes the specified activeYear from the range slider in the GapPlot view.
     *  It takes the value for the activeYear as the parameter. When the range slider is dragged, we have to update the
     *  gap plot and the info box.
     *  @param year the new year we need to set to the other views
     */
    function updateYear(year) {
        that.activeYear = year;

        infoBox.updateTextDescription(that.activeCountry, that.activeYear)

        let dropDownWrapper = d3.select(".dropdown-wrapper")
        let yValue = dropDownWrapper.select('#dropdown_y').select('.dropdown-content').select('select').node().value;
        let xValue = dropDownWrapper.select('#dropdown_x').select('.dropdown-content').select('select').node().value;
        let cValue = dropDownWrapper.select('#dropdown_c').select('.dropdown-content').select('select').node().value;

        gapPlot.updatePlot(that.activeYear, xValue, yValue, cValue);

        //TODO - Your code goes here - 

    }
    // Creates the view objects
    const infoBox = new InfoBox(data);
    const worldMap = new Map(data, updateCountry);
    const gapPlot = new GapPlot(data, updateCountry, updateYear, this.activeYear);


    // Initialize the plots; pick reasonable default values
    gapPlot.drawPlot();
    gapPlot.updatePlot(activeYear, 'fertility-rate', 'gdp', 'population');

    // here we load the map data
    d3.json('data/world.json').then(mapData => {

        worldMap.drawMap(mapData);

    });

    // This clears a selection by listening for a click
    let ignoreSlider = document.getElementById("year-slider")
    let ignoreDropdown =  document.querySelectorAll(".dropdown")
    
    document.addEventListener("click", function(e) {
        let target = e.target;
        if (target === ignoreSlider || ignoreSlider.contains(target)){
            return;
        }

        for (const ignore of ignoreDropdown) {
            if (target === ignore || ignore.contains(target)){
                return;
            }
        }
        worldMap.clearHighlight();
        gapPlot.clearHighlight();
        infoBox.clearHighlight();

        that.activeCountry = null
    }, true);
});

// ******* DATA LOADING *******
// We took care of that for you

/**
 * A file loading function or CSVs
 * @param file
 * @returns {Promise<T>}
 */
async function loadFile(file) {
    let data = await d3.csv(file).then(d => {
        let mapped = d.map(g => {
            for (let key in g) {
                let numKey = +key;
                if (numKey) {
                    g[key] = +g[key];
                }
            }
            return g;
        });
        return mapped;
    });
    return data;
}

async function loadData() {
    let pop = await loadFile('data/pop.csv');
    let gdp = await loadFile('data/gdppc.csv');
    let tfr = await loadFile('data/tfr.csv');
    let cmu = await loadFile('data/cmu5.csv');
    let life = await loadFile('data/life_expect.csv');

    //return [pop, gdp, tfr, cmu, life];
    return {
        'population': pop,
        'gdp': gdp,
        'child-mortality': cmu,
        'life-expectancy': life,
        'fertility-rate': tfr
    };
}
