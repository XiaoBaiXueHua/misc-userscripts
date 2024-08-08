// ==UserScript==
// @name         Export Hoyolab Map Tiles
// @namespace    https://sincerelyandyourstruly.neocities.org
// @version      1.0
// @description  Export map tiles from the hoyolab interactive map
// @author       小白雪花
// @match        https://act.hoyolab.com/ys/app/interactive-map/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hoyolab.com
// @grant        none
// ==/UserScript==

(function () {
    //the querySelector for the imgs is "img.leaflet-tile.leaflet-tile-loaded"; their x-pos attr is "data-x" n their y-pos attr is "data-y"
    function nodeToArr(obj) {
        return Array.prototype.slice.call(obj); //turn html node list into an array
    }
    function sortAttrib(arr, str) {
        arr.sort(function (a, b) { return parseInt(a.getAttribute(str)) - parseInt(b.getAttribute(str)) }); //sort array by attributes https://stackoverflow.com/questions/15593850/sort-array-based-on-object-attribute-javascript
    } //first sort by y, then x
    function openImgs(obj) {
        for (const img of obj) {
            window.open(img.src); //open the images in new tabs
        }
    }

    function pew() {
        var mapTiles = document.querySelectorAll("img.leaflet-tile.leaflet-tile-loaded");
        mapTiles = nodeToArr(mapTiles);
        sortAttrib(mapTiles, "data-y");
        sortAttrib(mapTiles, "data-x");
        console.log(mapTiles);
        openImgs(mapTiles);
    }
    function zeButton() {
        const button = document.createElement("button");
        button.id = "openImg";
        button.innerHTML = "Open Map Tiles";
        document.body.appendChild(button);
        button.addEventListener("click", pew);
        button.style.position = "fixed";
        button.style.top = "1em";
        button.style.right = "2em";
    }
    zeButton();
})();