/** Data structure for the data associated with an individual country. */
class InfoBoxData {
    /**
     *
     * @param country name of the active country
     * @param region region of the active country
     * @param indicator_name the label name from the data category
     * @param value the number value from the active year
     */
    constructor(country, region, indicator_name, value) {
        this.country = country;
        this.region = region;
        this.indicator_name = indicator_name;
        this.value = value;
    }
}

/** Class representing the highlighting and selection interactivity. */
class InfoBox {
    /**
     * Creates a InfoBox Object
     * @param data the full data array
     */
    constructor(data) {
        this.data = data

        this.countryToRegion = Object()
        data.population.map(d => this.countryToRegion[d.geo.toUpperCase()] = d.region)

        this.countryToName = Object()
        data.gdp.map(d => this.countryToName[d.geo.toUpperCase()] = d.country)

        let div = d3.select("#country-detail")
            .append("div")
            .classed("stats", true);

        div
            .append("i")
            .classed("fas fa-globe-asia", true)
            .style("opacity", 0);

        div
            .append("span")
            .classed("label", true);

        div.style("opacity", 0);
    }

    /**
     * Renders the country description
     * @param activeCountry the IDs for the active country
     * @param activeYear the year to render the data for
     */
    updateTextDescription(activeCountry, activeYear) {
        // ******* TODO: PART 4 *******
        // Update the text elements in the infoBox to reflect:
        // Selected country, region, population and stats associated with the country.
        /*
         * You will need to get an array of the values for each category in your data object
         * hint: you can do this by using Object.values(this.data)
         * you will then need to filter just the activeCountry data from each array
         * you will then pass the data as paramters to make an InfoBoxData object for each category
         *
         */
        if (activeCountry){
            
            let info = Object.values(this.data).map(function(d) {
                let countryData = d.filter(d => d.geo.toUpperCase() === activeCountry);
                if (countryData.length){
                    let region = countryData[0].hasOwnProperty['region'] ? countryData[0].region : 'countries';
                    let country = countryData[0].country;
                    let indicator_name = countryData[0].indicator_name;
                    let value = countryData[0][activeYear];
                    return new InfoBoxData(country, region, indicator_name, value)
                }
                
            }).filter(d => d != null)
            
            let div = d3.select("#country-detail").select(".stats")

            div.style("opacity", 1)

            div.select("i")
                .classed(`${this.countryToRegion[activeCountry] ? this.countryToRegion[activeCountry] : 'countries'}`, true)
                .style("opacity", 1)

            div.select(".stats span").html(this.countryToName[activeCountry])

            div.selectAll("div")
                .data(info)
                .join("div").classed("label", true)
                .html(d => `${d.indicator_name}:`)
                .append("span").html(d => `${d.value}`)
        }

    }

    /**
     * Removes or makes invisible the info box
     */
    clearHighlight() {
        let div = d3.select("#country-detail").select(".stats")
        div.select("i")
            .attr("class", "fas fa-globe-asia")

        div.style("opacity", 0)
    }

}