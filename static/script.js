// don't allow both warp and weft to be constant
document.querySelector("#warpConstant").onclick = function() {
    document.querySelector("#weftConstant").checked = false;
}

document.querySelector("#weftConstant").onclick = function() {
    document.querySelector("#warpConstant").checked = false;
}

// when parameters are changed, check to see whether we have enough information
// to make calculations and if yes, update the appropriate fields
// https://stackoverflow.com/questions/19655189/javascript-click-event-listener-on-class
document.querySelector("#dynamic_form").addEventListener('change', function(evt) {

    if (evt.target.id == "project_title" || evt.target.id == "description") {
        null
    }
    //if picks per inch field not filled out, suggest a balanced weave.
    if (evt.target.id == 'dpi' && !document.querySelector("#ppi").value) {
        document.querySelector("#ppi").value = document.querySelector("#dpi").value;
    }

    // if enough parameters are filled out to calculate the rest and recalculate whenever one is added/changed
    if (document.querySelector("#dpi").value &&
        document.querySelector("#ppi").value &&
        document.querySelector("#waste").value
    ) {

        // Keeping warp yarn constant
        if (document.querySelector('#warpConstant').checked && document.querySelector("#warp_yardage").value) {
            // dpi changed
            if (evt.target.id == 'dpi') {
                if (!document.querySelector("#length").value) {
                    updateLength();
                    updateTotalLength();
                    updateWeft();
                } else if (!document.querySelector("#width").value) {
                    updateWidth();
                } else if (document.querySelector("#ends").value) {
                    document.querySelector("#width").value = roundToQuarter(parseFloat(getEnds()) /
                        parseFloat(document.querySelector("#dpi").value));
                }

            }
            // if length is changed, update the width
            else if (evt.target.id == "length") {
                updateWidth();
            }
            // if width, loom waste, or total warp yardage is changed, update the length.
            else if (evt.target.id == "width" || evt.target.id == "waste" || evt.target.id == "warp_yardage") {
                updateLength();
            }
            // if picks per inch change, update the required weft yardage
            else if (evt.target.id == "ppi") {
                updateWeft();
            }
            // if anything else changed, preferentially update the width
            else {
                updateWidth();
            }

        }


        // Keeping weft yarn constant
        else if (document.querySelector('#weftConstant').checked && document.querySelector("#weft_yardage").value) {
            if (evt.target.id == 'dpi') {
                // if dpi changed, preferentially update the width
                if (!document.querySelector("#length").value) {
                    updateLength();
                    updateTotalLength();
                } else if (!document.querySelector("#width").value) {
                    updateWidth();
                } else if (document.querySelector("#ends").value) {
                    document.querySelector("#width").value = roundToQuarter(parseFloat(getEnds()) /
                        parseFloat(document.querySelector("#dpi").value));
                }
            }

            // if lenght if changed, update the width
            else if (evt.target.id == "length") {
                updateWidth();
            }
            // if width is changed, update the length
            else if (evt.target.id == "width") {
                updateLength();
            }
            // if picks per inch change, update the weft yarn required
            else if (evt.target.id == "ppi") {
                updateLength();
            }
            // if anything else changed, preferentially update the length
            else {
                updateLength();
                updateWidth();
            }
        }

        // if neither is checked but length and width are filled in, calulate requried warp and weft yardage
        else if (!document.querySelector("#warpConstant").checked &&
            !document.querySelector("#weftConstant").checked &&
            document.querySelector("#length").value
            && document.querySelector("#width").value
        ) {
            updateEnds(document.querySelector("#width").value);
            updateTotalLength(document.querySelector("#length").value);
            updateWarp();
            updateWeft();
        }
    }

})


// function to update warp ends and total warping length
function updateEnds(width) {
    var dpi = parseFloat(getDpi());
    var width = parseFloat(width);

    if (dpi && width) {
        document.querySelector("#ends").value = roundToEven(dpi * width);
    }
}

// function to update length of scarf when width changed
function updateLength() {
    var width = parseFloat(getWidth());

    if (width) {
        var updatedLength;

        if (document.querySelector("#warpConstant").checked) {
            var loomWaste = parseFloat(getLoomWaste());
            var warpYards = parseFloat(getWarpYardage());
            var dpi = parseFloat(getDpi());

            if (loomWaste && warpYards && dpi) {
                updatedLength = roundToQuarter((3 * warpYards / (width * dpi)) - (loomWaste / 12));
                document.querySelector("#length").value = updatedLength;
                updateWeft();
            }
        } else if (document.querySelector('#weftConstant').checked) {
            var weftYards = parseFloat(getWeftYardage());
            var ppi = parseFloat(getPpi());

            if (weftYards && ppi) {
                updatedLength = roundToQuarter(3 * weftYards / (width * ppi));
                document.querySelector("#length").value = updatedLength;
                updateWarp();
            }

        }
        // if something goes wrong, set length to 0
        else {
            updatedLength = 0;
        }
        updateTotalLength(updatedLength);
        updateEnds(width);
    }
}


// function to update total warping length and fill in end value if not yet filled
function updateTotalLength(length) {
    var loomWaste = parseFloat(getLoomWaste());

    if (length && loomWaste) {
        document.querySelector("#total_warp").value = formatFeet(parseFloat(length) + (loomWaste / 12));

        if (!document.querySelector("#ends").value && document.querySelector("#width").value) {
            updateEnds(getWidth());
        }
    }
}


// function to update the total required warp yardage
function updateWarp(width) {
    if (!width) {
        var width = getWidth();
    }
    var dpi = parseFloat(getDpi());
    var length = parseFloat(getLength());
    var loomWaste = parseFloat(getLoomWaste());

    if (dpi && width && length && loomWaste) {
        document.querySelector("#warp_yardage").value = Math.round(roundToEven(dpi * parseFloat(width)) * (length + loomWaste / 12)
            / 3);
    }
}


// function to update the total required weft yardaage
function updateWeft(width) {
    var length = parseFloat(getLength());
    var ppi = parseFloat(getPpi());
    if (!width) {
        var width = getWidth()
    } else {
        var width = parseFloat(width);
    }

    if (length && width && ppi) {
        document.querySelector("#weft_yardage").value = Math.round(length * width * ppi / 3);
    }
}


// function to update width of scarf when length changed
function updateWidth() {
    var length = parseFloat(getLength());
    var loomWaste = parseFloat(getLoomWaste());

    if (loomWaste && length) {
        var width = 0;

        if (document.querySelector('#warpConstant').checked) {
            var dpi = getDpi();
            var warpYards = parseFloat(getWarpYardage());

            if (dpi && warpYards) {
                width = roundToQuarter((warpYards * 3) / (length + (loomWaste / 12)) / dpi);
                updateWeft(width);
            }
        } else if (document.querySelector('#weftConstant').checked) {
            var ppi = parseFloat(getPpi());
            var weftYards = parseFloat(getWeftYardage());

            if (ppi && weftYards) {
                width = roundToQuarter((weftYards * 3) / (ppi * length));
                updateWarp(width);
            }
        }
        // if something goes wrong, set width to 0
        else {
            width = 0;
        }
        document.querySelector("#width").value = width;
        updateEnds(width);
        updateTotalLength(length);
    }


}


// utility mathing functions
function roundToQuarter(number) {
    // https://stackoverflow.com/questions/1553704/round-to-nearest-25-javascript
    return ((Math.ceil(number * 4) / 4).toFixed(2));
}

function roundToEven(number) {
    if (Math.round(number) % 2 == 0) {
        return Math.round(number);
    } else {
        return Math.round(number) + 1;
    }
}

function formatFeet(number) {
    var feet = Math.trunc(number);
    var inches = Math.round(12 * (number - Math.trunc(number)));
    return (feet + "ft " + inches + "in");
}


// utility functions to get values from the DOM
function getDpi() {
    return parseFloat(document.querySelector("#dpi").value);
}

function getEnds() {
    return parseFloat(document.querySelector("#ends").value);
}

function getLength() {
    return parseFloat(document.querySelector("#length").value);
}

function getLoomWaste() {
    return parseFloat(document.querySelector("#waste").value);
}

function getPpi() {
    return parseFloat(document.querySelector("#ppi").value);
}

function getWarpYardage() {
    return parseFloat(document.querySelector("#warp_yardage").value);
}

function getWeftYardage() {
    return parseFloat(document.querySelector("#weft_yardage").value);
}

function getWidth() {
    return parseFloat(document.querySelector("#width").value);
}
