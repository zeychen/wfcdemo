const Phaser = window.phaser;

var currentTile = 0;
var bmd;
var map;
var layer;
var cursors;
var facing = 'left';
var jumpTimer = 0;
var jumpButton;

class EditorView {
    constructor(tileNum, tileSize, height) {
        this.currentTileMarker = 0;
        this.tileNum = tileNum;
        this.tileSize = tileSize;
        this.selectorHeight = height;
    }

    Create(game, wfcMap, layer) {
        this.changedTileArray = new Array();
        this.Game = game;
        this.layer = layer;
        this.wfcMap = wfcMap;
        //  Creates a blank tilemap
        map = game.add.tilemap();
    
        // Adds tileset for tile selection
        map.addTilesetImage(wfcMap.tilesets[0].name, wfcMap.tilesets[0].name);
        
        map.create('level1', this.tileNum, this.tileNum + this.selectorHeight, this.tileSize, this.tileSize);
        let area = new Phaser.Rectangle(0, 0, this.tileSize * this.tileNum, this.tileSize * this.selectorHeight);
        
        bmd = game.make.bitmapData(this.tileSize * this.tileNum, this.tileSize * this.selectorHeight);
        bmd.addToWorld();
        
        var i = 0;
        for (var n = 0; n < this.selectorHeight; n++) {
            for (var m = 0; m < this.tileNum; m++) {
                map.putTile(i, m, n, layer);
                i++;                
            }
        }
    
    
    
        map.setCollisionByExclusion([0]);
    
        //  Create tile selector at the top of the screen
        this.CreateTileSelector(this.Game);
    
        // player = this.Game.add.sprite(64, 100, 'dude');
        // this.Game.physics.arcade.enable(player);
        // this.Game.physics.arcade.gravity.y = 350;
    
        // player.body.bounce.y = 0.1;
        // player.body.collideWorldBounds = true;
        // player.body.setSize(20, 32, 5, 16);
    
        // player.animations.add('left', [0, 1, 2, 3], 10, true);
        // player.animations.add('turn', [4], 20, true);
        // player.animations.add('right', [5, 6, 7, 8], 10, true);
    
        // cursors = this.Game.input.keyboard.createCursorKeys();
        // jumpButton = this.Game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
        this.Game.input.addMoveCallback(this.UpdateMarker, this);
    
    }
    
    Update(game, player) {
        game.physics.arcade.collide(player, layer);
    
        player.body.velocity.x = 0;
    
        if (cursors.left.isDown)
        {
            player.body.velocity.x = -150;
    
            if (facing != 'left')
            {
                player.animations.play('left');
                facing = 'left';
            }
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 150;
    
            if (facing != 'right')
            {
                player.animations.play('right');
                facing = 'right';
            }
        }
        else
        {
            if (facing != 'idle')
            {
                player.animations.stop();
    
                if (facing == 'left')
                {
                    player.frame = 0;
                }
                else
                {
                    player.frame = 5;
                }
    
                facing = 'idle';
            }
        }
        
        if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer)
        {
            player.body.velocity.y = -250;
            jumpTimer = game.time.now + 750;
        }
    
    }
    
    PickTile(sprite, pointer, game) {
        // console.log('pick tile');
        var x = this.Game.math.snapToFloor(pointer.x, this.tileSize, 0);
        var y = this.Game.math.snapToFloor(pointer.y, this.tileSize, 0);
    
        this.currentTileMarker.x = x;
        this.currentTileMarker.y = y;
    
        x /= this.tileSize;
        y /= this.tileSize;
    
        currentTile = x + (y * this.tileNum);
    
        // console.log(currentTile);
    }
    
    CreateTileSelector(game) {
    
        //  Our tile selection window
        var tileSelector = game.add.group();
    
        var tileSelectorBackground = game.make.graphics();
        tileSelectorBackground.beginFill(0x000000, 0.3);
        tileSelectorBackground.drawRect(0, 0, this.tileSize*this.tileNum, this.tileSize*this.selectorHeight);
        tileSelectorBackground.endFill();
    
        tileSelector.add(tileSelectorBackground);
    
        var tileStrip = tileSelector.create(1, 1, bmd);
        tileStrip.inputEnabled = true;
        tileStrip.events.onInputDown.add(this.PickTile, this);
    
        //  Our painting marker
        this.marker = game.add.graphics();
        this.marker.lineStyle(2, 0x000000, 1);
        this.marker.drawRect(0, 0, this.tileSize, this.tileSize);
    
        //  Our current tile marker
        this.currentTileMarker = game.add.graphics();
        this.currentTileMarker.lineStyle(1, 0xffffff, 2);
        this.currentTileMarker.drawRect(0, 0, this.tileSize, this.tileSize);
    
        // console.log(this.currentTileMarker)
    
        tileSelector.add(this.currentTileMarker);
    
    
    }
    
    UpdateMarker() {
        this.marker.x = this.layer.getTileX(this.Game.input.activePointer.worldX) * this.tileSize;
        this.marker.y = this.layer.getTileY(this.Game.input.activePointer.worldY) * this.tileSize;
        if (this.Game.input.mousePointer.isDown && this.marker.y >= this.tileSize*this.selectorHeight)
        {
            this.wfcMap.removeTile(this.layer.getTileX(this.marker.x), this.layer.getTileY(this.marker.y-(this.tileSize*this.selectorHeight)), this.layer);
            map.putTile(currentTile, this.layer.getTileX(this.marker.x), this.layer.getTileY(this.marker.y), this.layer);
            
            // Calculates the index of tile changed in map
            var arrayIndex = this.layer.getTileX(this.marker.x) + (this.layer.getTileY(this.marker.y)-this.selectorHeight) * this.tileNum;
            
            // Create array of tiles placed and index position of placed tile on map pair
            var changedTileObject = new Object();
            let tilePlaced = map.getTile(this.layer.getTileX(this.marker.x), this.layer.getTileY(this.marker.y));
            changedTileObject.tile = tilePlaced.index;   // tile placed
            changedTileObject.index = arrayIndex; // index position of placed tile on map
            this.changedTileArray.push(changedTileObject);
            // console.log(this.changedTileArray);
        }
    }
    
    GetChangedTilePair() {
        return this.changedTileArray;
    }
}

class MainState extends Phaser.State {
    init(selectorY, tileSize, tileNum, tileMap, editor, includeItem){
        this.tileMap = tileMap;
        this.selectorY = selectorY;
        this.tileSize = tileSize;
        this.tileNum = tileNum;
        this.mapName = 'map';
        this.editor = editor;
        this.includeItem = includeItem;
        // debugger
    }

    preload () {

        this.game.load.tilemap(this.mapName, null, this.tileMap, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('Town_A', 'assets/tilesets/wolfsong/Town_A.png');
        this.game.load.image('car', 'assets/sprites/car.png');
        this.game.load.image('ball', 'assets/sprites/blue_ball.png');
        this.game.load.image('key', 'assets/sprites/key.png');
        this.game.load.image('chest', 'assets/sprites/chest.gif');
        // this.game.load.image(tileSet.name,tileSet.path);    //game.load.image('Town_A', 'assets/tilesets/wolfsong/Town_A.png'); 
        // this.game.load.tilemap(tileMap.name, null, tileMap.tilemap,Phaser.Tilemap.TILED_JSON);  //game.load.tilemap('testPCG', null, pcg_tilemap, Phaser.Tilemap.TILED_JSON);
    }

    create () {
        this.game.stage.backgroundColor = '#ccc';
        // console.log(this.tileMap);
        this.map = this.game.add.tilemap(this.mapName);
        // console.log(this.map);
        
        this.map.addTilesetImage(this.map.tilesets[0].name, this.map.tilesets[0].name);
        // this.map.addTilesetImage(this.map.tilesets[1].name, this.map.tilesets[1].name);
    
        let layer = this.map.createLayer(0);
        layer.fixedToCamera = false;
        // move layer in y direction to make room for selector
        layer.position.setTo(0, this.selectorY* this.tileSize);
    
        // Creates editor selection
        // this.editor = new EditorView(this.tileNum, this.tileSize, this.selectorY);
        // this.tileChanged = this.editor.GetChangedTilePair();
        // console.log(this.tileChanged);
        // console.log(typeof EditorView.Create(this.game, this.map, layer));

        // Create items group
        let items = this.game.add.group();
        items.enableBody = true;
        // Display objects using gid, x, and y position specified in TileMapModel JSON
        if(this.includeItem == true){
            this.map.createFromObjects('items', this.tileNum*this.tileNum+1, 'key', 0, true, false, items);
            this.map.createFromObjects('items', this.tileNum*this.tileNum+2, 'chest', 0, true, false, items);
        }

        // Create editor layer
        this.editor.Create(this.game, this.map, layer);
        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.refresh();

        layer.resizeWorld();
        return [this.game, this.map, layer];
    }
}



class PhaserView {
    constructor(phaserParam) {
        this.setParam(phaserParam);
    }

    getTileUpdated() {
        this.tileChanged = this.editor.GetChangedTilePair();
        return this.tileChanged;
    }

    setParam (phaserParam) {
        this.selectorY = phaserParam.selectorY;
        this.tileSize = phaserParam.tileSize;
        this.tileNum = phaserParam.tileNum;
        this.worldLength = phaserParam.worldLength;
        this.worldWidth = phaserParam.worldWidth;  
        this.tileMap = phaserParam.tileMap;
        this.includeItem = phaserParam.includeItem;   
        // debugger 
    }

    destroyOldGame() {
        this.game = this.game.destroy(true);
        this.game = null;
    }

    createNewGame() {
        // this.items = new ItemView(this.tileNum, this.tileSize);
        this.editor = new EditorView(this.tileNum, this.tileSize, this.selectorY);
        this.game = new Game(this.worldLength, this.worldWidth, this.selectorY, this.tileSize, this.tileNum, this.tileMap, this.editor, this.includeItem);
    }
}

class Game extends Phaser.Game {

	constructor(worldLength, worldWidth, selectorY, tileSize, tileNum, tileMap, editor, includeItem) {
        super(worldWidth, worldLength, Phaser.AUTO, 'content', null);
        this.state.add('MainState', MainState, false);
        this.state.start('MainState', false, false, selectorY, tileSize, tileNum, tileMap, editor, includeItem);
	}

}

class View {
    constructor() {
        this.getInputs();
        this.exportButton = document.getElementById("exportButton");
        this.numButton = document.getElementById("numButton");
        // this.itemToggle = +document.getElementById("itemToggle").value;
    }

    getTileUpdated() {
        this.tileChanged = this.phaserView.getTileUpdated();
        return this.tileChanged;
    }

    getInputs() {
        this.tileNum = +document.getElementById("tileNumInput").value;      // number of tiles in x
        this.tileSize = +document.getElementById("tileSizeInput").value;    // defaults to 32 pixels
    }

    displayPhaserView(phaserParam) {
        this.phaserView = new PhaserView(phaserParam); 
        this.phaserView.createNewGame();
        return this.phaserView;
    }

    updatePhaserView(phaserParam) {
        this.phaserView.setParam(phaserParam);
        this.phaserView.destroyOldGame();
        this.phaserView.createNewGame();
    }

    //for future
    displayBabylonView() {
        return 0;
    }

}

function GetNeighbors(tiles) {
    let neighbors = {
        tiles: []
    }
    let tile_names = tiles["names"]
    for (let i = 0; i < tile_names.length; i++) {
        for (let j = 0; j < tile_names.length; j++) {
            if (i == j) {
                continue;
            }
            neighbors["tiles"].push({"left":tile_names[i], "right":tile_names[j]})
        }
    }
    // debugger
    return neighbors
}

function GenerateTiles(tiles_info, width, height) {
    let tile, tile_name, new_tile, compatible, log_weights, cumulative_weights;
    let carray = [];
    let sum_of_weights = 0;
    let sum_of_log_weights = 0;
    let tiles = {
        types: [],
        rotations: [],
        names: [],
        weights: [],
        IDs: {},
        amount : 0
    };
    let cardinality = 1;
    let tile_ID = 0;

    let rotation = function(x) { return x; }    // calculator rotation value to add to tile ID to get correct tile
    let mirror = function(x) { return x; }  // calculator mirrored tile's value to get correct tile
    
    for (let i = 0; i < tiles_info.length; i++) {
        tile = tiles_info[i];

        switch(tile.symmetry) {
            case 'X':
                break;
            case 'L':
                cardinality = 4;
                rotation = function(x) { return (x + 1) % 4; }
                mirror = function(x) { return 3-x; }
                break;
            case 'T':
                cardinality = 4;
                // debugger
                rotation = function(x) { return (x + 1) % 4; }
                mirror = function(x) { return x % 2 == 0 ? 2-x : x; }
                break;
            case 'I':
                cardinality = 2;
                rotation = function(x) { return 1 - x; }
                mirror = function(x) { return x }
                break;
            case '\\':
                cardinality = 2;
                rotation = function(x) { return 1 - x; }
                mirror = function(x) { return 1 - x; }
                break;
            default: // Tiles with no manually assigned symmetries will default to X sym.
                console.warn("symmetry for tile " + tile.name + "is not set! Setting symmetry to default symmetry of X. Please change symmetry.")
                break;
        }
        
        for (let c = 0; c < cardinality; c++) {
            tile_name = tile.name + ' ' + c.toString();
            // console.log(tile_name)
            new_tile = [
                c + tile_ID,
                rotation(c) + tile_ID,
                rotation(rotation(c)) + tile_ID,
                rotation(rotation(rotation(c))) + tile_ID,
                mirror(c) + tile_ID,
                mirror(rotation(c)) + tile_ID,
                mirror(rotation(rotation(c))) + tile_ID,
                mirror(rotation(rotation(rotation(c)))) + tile_ID
            ]
            // debugger
            tiles["types"].push(tile.type);
            tiles["names"].push(tile_name);
            tiles["rotations"].push(new_tile)
            tiles["weights"].push(tile.weight || 1);
            tiles["IDs"][tile_name] = tile_ID + c;
            tiles["amount"]++;
        }
        tile_ID += cardinality;
    }


    // compatible tiles should be calculated according to neighbor constraints?
    compatible = new Array(tiles.amount);
    log_weights = new Array(tiles.amount);
    cumulative_weights = tiles.weights.reduce(function(a,b,i){return carray[i]=a+b;},0);
    // debugger

    for (let j = 0; j < width * height; j++) {
        compatible[j] = new Array(tiles.amount);

        for (let k = 0; k < tiles.amount; k++) {
            compatible[j][k] = new Array(4);
        }
    }

    // used for calculating entropy
    for (let t = 0; t < tiles.amount; t++) {
        log_weights[t] = (tiles.weights[t] * Math.log(tiles.weights[t]));    // negative of shannon's entropy
        sum_of_weights += tiles.weights[t]; // total weight for an element in wave array
        sum_of_log_weights += log_weights[t];   // total entropy for an element in wave array
    }
    tiles["compatible"] = compatible;
    tiles["log_weights"] = log_weights;
    tiles["sum_of_weights"] = sum_of_weights;
    tiles["sum_of_log_weights"] = sum_of_log_weights;
    tiles["starting_entropy"] = Math.log(sum_of_weights) - sum_of_log_weights / sum_of_weights;
    tiles["possible_choices"] = new Array(width * height);
    tiles["sums_of_weights"] = new Array(width * height);
    tiles["sums_of_log_weights"] = new Array(width * height);
    tiles["entropies"] = new Array(width * height);
    tiles["carray"] = carray;
    tiles["csumweight"] = cumulative_weights;

    return tiles
}


function WFC(periodic, width, height, tileset_info, tile_rule, item_rule) {
    console.time('WFC');
    let data = tileset_info["data"];
    let num_elem = 0;
    
    let tile_data = GenerateTileData(data, width, height);
    let neighbor_propagator = tile_data["neighbor_propagator"]; //TODO: this is dumb
    let tile_amount = tile_data.tiles.amount;

    let wave = GenerateWave(tile_amount, width, height);
    
    let result = null;
    let definite_state = 0;
    let init = true;
    
    
    Clear(wave, tile_amount, tile_data);
    
    let elems_to_remove = [];

    
    while (definite_state != 1) {
        definite_state = 0; 
            let elem_data = tile_data['tiles'];
            let elem = 'tiles';
            // if(elem=='items') {debugger}
            if(num_elem == 1){
                init = false;
            } else {
                num_elem += 1;
            }
            // result returns [chosen tile, chosen index], true (argmin == -1), false (possiblities == 0), or null
            result = Observe(wave, elem_data, elem, elems_to_remove, periodic, width, height, init);
                        
            // Converts index to name to match with rules
            if (result === true) {
                definite_state++;
            } else if (result === false) {
                // throw 'Oh Crap'
                // console.log('crap')
                return [];
            } 
            
            Propagate(wave, elems_to_remove, periodic, width, height, elem_data, neighbor_propagator, elem)

    }
    let tiles = tile_data["tiles"].names
    //DONE
    // console.log(wave);

    // debugger
    return GenerateTileMap(wave, tile_amount, tiles, width, height)
}

/**
 * Clear
 * Will reset the wave to an unobserved state (as in all true).
 * Reset the compatible tiles by going backward through the propgator data collection.
 * Reset all entropies for all data that can be observed (tiles, items, etc)
 * @param {matrix} wave 
 * @param {int} tile_amount 
 * @param {json} tile_data 
 */
function Clear(wave, tile_amount, tile_data) {
    let opposite = [2, 3, 0, 1];
    let tiles = tile_data.tiles;
    for (let i = 0; i < wave.length; i++) {
        for (let t = 0; t < tile_amount; t++) {
            wave[i]["tiles"][t] = true;
        }
    }

    for (let w = 0; w < wave.length; w++) {
        for (let t = 0; t < tile_amount; t++) {
            for (let d = 0; d < 4; d++) {
                tiles.compatible[w][t][d] = tile_data.neighbor_propagator[opposite[d]][t].length; // compatible is the compatible tiles of t. NOT t itself. Which is why opposite is involved.
            }
        }
    }
    for (let t = 0; t < wave.length; t++) {
        tiles.possible_choices[t] = tiles.weights.length;
        tiles.sums_of_weights[t] = tiles.sum_of_weights;
        tiles.sums_of_log_weights[t] = tiles.sum_of_log_weights;
        tiles.entropies[t] = tiles.starting_entropy;
    }
}

/**
 * GnereateTileMap
 * Uses wave booleans to create a new array from the data indexes.
 * @param {matrix} wave 
 * @param {int} tile_amount 
 * @param {int} item_amount 
 * @param {json} tiles 
 * @param {json} items 
 * @param {int} width 
 * @param {int} height 
 */
function GenerateTileMap(wave, tile_amount, tiles, width, height) {
    let array = [];
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            let tile_elem = wave[y + x * height]["tiles"];
            let amount = 0;
            for (let i = 0; i < tile_elem.length; i++) {
                if (tile_elem[i]) {
                    amount += 1;
                }
            }
            if (amount == tile_amount) {
                // console.warn(amount)
            } else {
                for (let t = 0; t < tile_amount; t++) {
                    if (tile_elem[t]) {
                        array.push(tiles[t]);
                    }
                }
            }
        } 
    }
    // debugger
    console.timeEnd('WFC');
    if(array.length != 0) {
        return array;
    } else {
        throw 'No Map Generated'
    }
    
}

/**
 * GenerateTileData
 *  Takes data and converts data into something that WFC can read.
 * @param {array} data 
 * @returns {object} subsets
 */
function GenerateTileData(data, width, height) {
    let tiles = Constraints.GenerateTiles(data["tiles_info"], width, height);
    let neighbors = data["neighbors"].length != 0 ? data["neighbors"] :
                    Constraints.GetNeighbors(tiles)
    let neighbor_propagator = GeneratePropagator(neighbors, tiles)

    let tile_data = {
        "tiles": tiles,
        "neighbors": neighbors,
        "neighbor_propagator": neighbor_propagator
    }
    return tile_data;
}

/**
 * GeneratePropagator
 * @param {*} neighbors 
 * @param {*} tiles 
 * @param {*} items 
 * Returns a matrix of possible neighboring tiles.
 * @returns {object} locality_propagator    
 */
function GeneratePropagator(neighbors, tiles) {
    let sparse_propagator;
    let neighbor_pair;
    let left, right, L_ID, R_ID, L, R, D, U;

    let neighbor_tiles = neighbors;

    let locality_propagator = new Array(4)
    let propagator = new Array(4);
    
    let tile_names = tiles["names"];

    // creates locality_propagator and propagator
    // array of 4 elements, each element is an array equal to the number of tiles
    for (let d = 0; d < 4; d++) { // d is for direction.
        locality_propagator[d] = new Array(tile_names.length); // all the tiles. We are reaching that superposition stuff
        propagator[d] = new Array(tile_names.length); // all the tiles. We are reaching that superposition stuff
        for (let t = 0; t < tile_names.length; t++) {
            locality_propagator[d][t] = new Array(tile_names.length); // This will be the bool array. Since each tile should know what it's possible neighbor tile is.
            propagator[d][t] = new Array(tile_names.length).fill(false); // This will be the bool array. Since each tile should know what it's possible neighbor tile is.
        }
    }
    for (let i = 0; i < neighbor_tiles.length; i++) {
        // dissect neighbor constraints
        neighbor_pair = neighbor_tiles[i];
        left = neighbor_pair.left
        right = neighbor_pair.right
        L_ID = tiles["IDs"][left];  // user defined rotation for left tile
        R_ID = tiles["IDs"][right]  // user defined rotation for right tile
        L = tiles["rotations"][L_ID];   // uses tile id number
        R = tiles["rotations"][R_ID];   // array of tile id number according to its rotations
        D = tiles["rotations"][L[1]];
        U = tiles["rotations"][R[1]];
        
        // determines which neighbor tiles can exist
        propagator[0][L[0]][R[0]] = true;   // propagator[R, U, L, D]
        propagator[0][L[6]][R[6]] = true;
        propagator[0][R[4]][L[4]] = true;
        propagator[0][R[2]][L[2]] = true;

        propagator[1][D[0]][U[0]] = true;
        propagator[1][U[6]][D[6]] = true;
        propagator[1][D[4]][U[4]] = true;
        propagator[1][U[2]][D[2]] = true;

    }
    for (let t = 0; t < tile_names.length; t++) {
        for (let t2 = 0; t2 < tile_names.length; t2++) {
            propagator[2][t][t2] = propagator[0][t2][t];
            propagator[3][t][t2] = propagator[1][t2][t];
        }
    }

    sparse_propagator = new Array(4);
    for (let d = 0; d < 4; d++) {
        sparse_propagator[d] = new Array(4);
        for (let t = 0; t < tile_names.length; t++) {
            sparse_propagator[d][t] = [];
        }
    }
    for (let d = 0; d < 4; d++) {
        for (let t = 0; t < tile_names.length; t++) {
            let sp = sparse_propagator[d][t];
            let p = propagator[d][t]

            for (let t1 = 0; t1 < tile_names.length; t1++) {
                if (p[t1]) {
                    sp.push(t1);
                }
            }
            locality_propagator[d][t] = sp;
        }
    }
    return locality_propagator;
}
/**
 * GenerateWave
 * @param {*} tile_amount 
 * @param {*} item_amount 
 * @param {*} width 
 * @param {*} height
 * @returns matrix with each element being a true boolean array size of tiles. 
 */
function GenerateWave(tile_amount, width, height) {
    let wave = new Array(width * height)
    for (let i = 0; i < width * height; i++) {
        wave[i] = {
            "tiles" : new Array(tile_amount).fill(true)
        }
    }
    return wave;
}

function Observe(wave, elem_data, elem, elems_to_remove, periodic, width, height, init) {
    let noise, entropy, possiblities;
    let min = 1000;
    let argmin = -1;    // wave_element_index
    let r;
    
    // update min to reflect highest entropy and noise
    for (let i = 0; i < wave.length; i++) {
        if (OnBoundary(i % width, i / width, periodic, width, height)) {
            continue;
        }
        possiblities = elem_data.possible_choices[i];
        // console.log(possiblities)
        if (possiblities == 0) {
            // debugger
            return false;
        }
        entropy = elem_data.entropies[i];
        if (possiblities > 1 && entropy <= min) {
            // let noise = 0.000001 * this.random();
            noise = 0.000001;
            if (entropy + noise < min) {
                min = entropy + noise;
                argmin = i;
            }
        }
    }
    if (argmin == -1) {
        return true;
    }
    // debugger
    
    if(init == true) {
        argmin = Math.floor(Math.random()*wave.length);
        init = false;
    }

    // Creates distribution array that reflects the weight of each tile according to the number of tiles in an element of the wave
    let distribution = new Array(elem_data.amount);
    let w = wave[argmin][elem];
    for (let t = 0; t < elem_data.amount; t++) {
        distribution[t] = w[t] ? elem_data.weights[t] : 0;
    }

    // {int} r: randomly choosen tile index using weighted selection
    r = _NonZeroIndex(distribution, elem_data.carray, elem_data.csumweight);

    /**
     * Decides which tiles to ban
     * loop through number of tiles
     * if counter is equal to randomly chosen tile AND wave already knows its false then ban the tile
     */
    
    for (let t = 0; t < elem_data.amount; t++) {
        
        if (w[t] != (t == r)) {
            // argmin = wave element index to remove
            // t = tile index to remove
            elems_to_remove = Ban(wave, elem_data, elem, argmin, t, elems_to_remove, 'observation');
        } 
    }
    
    // debugger
    return null;
}

function Propagate(wave, elems_to_remove, periodic, width, height, elem_data, neighbor_propagator, elem) {
    let DX = [1, 0, -1, 0]; // [right, up, left, down]
    let DY = [0, -1, 0, 1]; // [right, up, left, down]
    if (elem_data.compatible == undefined) {
        return [];
    }
    // item elem_to_remove never reaches this while loop
    while(elems_to_remove.length > 0) {
        // debugger
        let e1 = elems_to_remove.pop(); // element 1

        let index_1 = e1[0]; // index of element to remove
        let tile_1 = e1[1]; // tile within element to remove
        let x1 = index_1 % width;   // calculates x position of tile in map
        let y1 = Math.floor(index_1 / width);   // calculate y position of tile in map

        for (let d = 0; d < 4; d++) {
            let dx = DX[d];
            let dy = DY[d];
            let x2 = x1 + dx;   // x position of neighbor
            let y2 = y1 + dy;   // y position of neighbor

            // boundary check
            if (OnBoundary(x2, y2, periodic, width, height)) {
                continue;
            }
            
            // x position correction for index_2 calculation?
            if (x2 < 0) {
                x2 += width;
            } else if (x2 >= width) {
                x2 -= width;
            }

            if (y2 < 0) {
                y2 += height;
            } else if (y2 >= height) {
                y2 -= height;
            }

            // 
            let index_2 = x2 + y2 * width;  // Item 2 - calculates index of neighbor tile element within map
            let p = neighbor_propagator[d][tile_1]; // an array of tiles to remove according to d
            /* neighbor_propagator is a matrix
             * each element corresponds to [right, up, left, down]
             * each element is an array of all tiles
             * each tile is an array of tile index to remove from wave 
             * */
            let compat = elem_data.compatible[index_2]; // a matrix of number of compatible tiles
            
            for (let l = 0; l < p.length; l++) {
                let tile_2 = p[l]   // position of neighbor tile to remove
                let comp = compat[tile_2];  // array of number of compatible tiles with neighbor tile to be removed
                comp[d] = comp[d] - 1;  // decrease number of compatible tiles according to d
                if (comp[d] == 0) {
                    elems_to_remove = Ban(wave, elem_data, elem, index_2, tile_2, elems_to_remove, 'propagate');
                }
            }
        }
    }
    // debugger
    return elems_to_remove
}

/**
 * Ban
 *  Removes tiles from wave.
 * @param {matrix} wave 
 * @param {object} elem_data
 * @param {int} wave_index : index of element in wave
 * @param {int} wave_elem : index of tile within element
 * @param {array} elems_to_remove 
 * @returns {array} elements to remove in wave
 */
function Ban(wave, elem_data, elem, wave_index, wave_elem, elems_to_remove, origin) {
    let wave_array = wave[wave_index][elem];    // creates array of tiles in chosen element

    // This is where Ban actually bans the undesired tile
    wave_array[wave_elem] = false;  // set tile to false according to wave_elem passed in

    // This is where Ban takes it a step further to get rid of the banned tile's number of compatible tiles
    if (elem_data.compatible != undefined) {
        // elem_data.compatible contains number of compatible tiles
        elem_data.compatible[wave_index][wave_elem] = [0,0,0,0];    // set the false tile's corresponding set of compatible tiles to 0
    }

    // Now it's time to actually set the banned tile up for removal 
    elems_to_remove.push([wave_index, wave_elem]);  // add the false tile to elems_to_remove array

    // Need to recalculate entropy for the element in the wave using Shannon Entropy
    if(elem_data.sums_of_weights[wave_index] == elem_data.weights[wave_elem] || elem_data.entropies == NaN) { 
        // console.log('oh crap ' + origin + ' is causing issues'); 
        // console.log('so is: ' + elem)
        throw 'conflict detected'
    }
    let sum = elem_data.sums_of_weights[wave_index];    // get sum of weights for element with false tile
    elem_data.entropies[wave_index] += elem_data.sums_of_log_weights[wave_index] / sum - Math.log(sum); // recalculate entropy
    elem_data.possible_choices[wave_index] -= 1;    // decrease possible choices according to wave_index
    elem_data.sums_of_weights[wave_index] -= elem_data.weights[wave_elem];  
    elem_data.sums_of_log_weights[wave_index] -= elem_data.log_weights[wave_elem];
    sum = elem_data.sums_of_weights[wave_index];    // get sum of weights for element with false tile
    elem_data.entropies[wave_index] -= elem_data.sums_of_log_weights[wave_index] / sum - Math.log(sum);

    return elems_to_remove;
}

function BinarySearch(array, value, start, end) {
    const middle = Math.floor((start + end)/2);
    if (value == array[middle] || (value < array[middle] && value > array[middle-1])) return array[middle];
    if (end - 1 === start) return Math.abs(array[start] - value) > Math.abs(array[end] - value) ? array[end] : array[start]; 
    if (value > array[middle]) return BinarySearch(array, value, middle, end);
    if (value < array[middle]) return BinarySearch(array, value, start, middle);
}

/**
 * Weighted choosing of tiles
 * @param {array} array: wave element 
 */
function _NonZeroIndex(distribution, cweights, csumweight) {
    let random = Math.random()*(csumweight+1);
    let choice = Math.floor(random);
    // binary search for first value that is larger than choice in cweights
    let tile_choice = BinarySearch(cweights, choice, 0, cweights.length);
    let index = cweights.indexOf(tile_choice);
    let elem = distribution[index];
    while(elem == 0) {
        choice = Math.floor(Math.random()*csumweight);
        tile_choice = BinarySearch(cweights, choice, 0, cweights.length);
        index = cweights.indexOf(tile_choice);
        elem = distribution[index];
    }
    
    return index;

}  

function OnBoundary(x, y, periodic, width, height) {
    return !periodic && (x < 0 || y < 0 || x >= width || y >= height);
}

class TileMapModel {
    constructor (tilesize, subset,height, width, tileJSON, tile_rule, item_rule, num_items) {
        this.num_items = num_items;
        this.tile_rule = tile_rule;
        this.item_rule = item_rule;
        this.tilesize = tilesize;
        this.height = height;
        this.width = width;
        this.periodic = false;
        this.subset = subset;
        this.tileJSON = tileJSON;
        this.tileCount = 128;
        this.constraints = null;
        this.tileMapArray = this.getWFCModel();
        this.tileMap = this.getTile2DJSON();
        // this.tiles = this.getMap(0);
        // console.log(this.tileMapArray);
    }

    getWFCModel() {
        this.model = WFC(this.periodic, this.height, this.width, this.tileJSON, this.tile_rule, this.item_rule); 
        // console.log(this.model);
        if(this.model.length == 0) { debugger}
        // debugger
        return this.model;
    }

    // Input: int a - 0 >> array of tiles; 1 >> array of items
    // Output: [tile, tile ...]
    getMap(a) {

        var array = [];
        var elements, element, tile_number, rotation;
        switch(a) {
            case 1:
                for (let i = 0; i < this.tileMapArray.length; i++){
                    elements = this.tileMapArray[i];
                    element = elements.split(/[ ]+/);
                    array.push(element[a+1]);
                }
                break;
            case 0:
                for (let i = 0; i < this.tileMapArray.length; i++) {
                    elements = this.tileMapArray[i];
                    element = elements.split(/[ ]+/);
                    tile_number = parseInt(element[a]);
                    rotation = element[a+1];
                    switch (rotation) {
                        case '3':
                        array.push(tile_number + 0xA0000000);
                            break;
                        case '2':
                        array.push(tile_number + 0xC0000000);
                            break;
                        case '1':
                        array.push(tile_number + 0x60000000);
                            break;
                        case '0':
                        array.push(tile_number);
                            break;
                        default:
                        array.push(tile_number);
                            break;
                    }
                }
        }
        return array;
    }

    calculateItemPosition(id) {
        let x=id*this.tilesize;
        let y=0;
        

        if (id >= this.width ){
            x = (id % this.width)*this.tilesize;
            y = (Math.floor(id / this.width))*this.tilesize;
        }
        return [x,y];
    }

    createItemObjects() {
        let itemsObjectArray = [];
        let j = 0;
        let gid;
        let items = this.getMap(1);
        let gids=[];
        let editorHeight = Math.ceil(this.tileCount/this.width)+1;
        
        for(let i = 1;i <= this.num_items; i++){
            gids[i] = this.tileMapArray.length+i;
        }
        
        if(this.subset == 'item'){
            for (let i = 0; i < items.length; i++){
                
                if (items[i]>0){
                    
                    gid = gids[items[i]];

                    let itemJSON = {
                        "gid":gid,
                        "id":j,
                        "name":this.subset,
                        "rotation":0,
                        "visible":true,
                        "width": 0,
                        "x":this.calculateItemPosition(i)[0], //position x
                        "y":this.calculateItemPosition(i)[1]+(editorHeight*this.tilesize)
                    }
                    itemsObjectArray.push(itemJSON);
                    j++;
                }
            }
        } else {
            throw 'No item subset given'
        }
            
        return itemsObjectArray;
    }

    // Output: JSON file compatiblewith Tiled2D
    getTile2DJSON() {
        let tile2DJSON = {
            "height":this.height,
            "infinite": false,
            "layers":[
                {
                    "id": 1,
                    "data": this.getMap(0),
                    "height":this.height,
                    "name":"Map",
                    "opacity":1,
                    "type":"tilelayer",
                    "visible":true,
                    "width":this.width,
                    "x":0,
                    "y":0
                },
                {
                    "draworder":"topdown",
                    "height":this.height,
                    "name":"items",
                    "objects":this.createItemObjects(),
                    "opacity":1,
                    "type":"objectgroup",
                    "visible":true,
                    "width":this.width,
                    "x":0,
                    "y":0
                  }],
            "nextobjectid":1,
            "nextlayerid": 2,
            "orientation":"orthogonal",
            "renderorder":"right-down",
            "tiledversion":"1.2",
            "tileheight":32,
            "tilesets":[
                {
                    "columns":8,
                    "firstgid":1,
                    "image":"../../assets/tilesets/wolfsong/Town_A.png",
                    "imageheight":512,
                    "imagewidth":256,
                    "margin":0,
                    "name":"Town_A",
                    "spacing":0,
                    "tilecount":this.tileCount,
                    "tileheight":32,
                    "tilewidth":32
                }, 
                {
                    "firstgid":this.tileMapArray.length+1,
                    "image":"../../assets/sprites/car.png",
                    "imageheight":32,
                    "imagewidth":32,
                    "margin":0,
                    "name":"car",
                    "spacing":0,
                    "tilecount":1,
                    "tileheight":32,
                    "tilewidth":32
                   },
            ],
            "tilewidth":32,
            "type":"map",
            "version":1.2,
            "width":this.width
        }
        return tile2DJSON; 
    }
        
}

// Controller parameters: type, tileJSON, subset, newGame
class Controller {
    // type = view type such as Phaser or Babylon
    constructor(type, tileJSON, subset, newGame, includeItem, tile_rule, item_rule, num_items) {
        this.num_items = num_items
        this.tile_rule = tile_rule;
        this.item_rule = item_rule;
        this.tileJSON = tileJSON;   // object of tiles and neighbors
        // this.tileConstraints = tileConstraints; // object of tiles and neighbors
        this.viewType = type;
        this.view = new View();
        this.subset = subset;
        //TileMapModel parameters: int height, int width, {tile, neighbors}
        this.model = new TileMapModel(this.view.tileSize, this.subset, this.view.tileNum, this.view.tileNum, this.tileJSON, this.tile_rule, this.item_rule, this.num_items);  
        // console.log(this.model);
        this.newGame = newGame;
        this.includeItem = includeItem;
        // this.updateTileMap();
    }

    itemToggle() {
        let phaserParam = this.getPhaserViewParam();
        this.displayView = this.view.updatePhaserView(phaserParam);
        return this.displayView;
    }

    updateTileMap() {
        // console.log(this.model.tiles);
        let tiles = this.getTilesUpdated();
        // console.log(tiles);
        let sortedTiles = tiles.sort(function compare(a, b) {
            const indexA = a.index;
            const indexB = b.index;
          
            let comparison = 0;
            if (indexA > indexB) {
              comparison = 1;
            } else if (indexA < indexB) {
              comparison = -1;
            }
            return comparison;
          }
        );

        for (let i = 0; i < sortedTiles.length; i++) {
            this.model.tiles[sortedTiles[i].index] = sortedTiles[i].tile;
        }
    }

    getTileNum() {
        return this.view.tileNum;
    }

    getTilesUpdated() {
        this.tilesUpdated = this.view.getTileUpdated();
        return this.tilesUpdated;
    }

    getTile2DJSON() {
        this.tile2DJSON = this.model.getTile2DJSON();
        return this.tile2DJSON;
    }

    calculateViewParam() {
        this.selectorY = Math.ceil(this.model.tileMap.tilesets[0].tilecount/this.view.tileNum); // number of rows of tiles
        this.worldWidth = this.view.tileSize * this.view.tileNum;   // x size of world (pixels)
        this.worldLength = this.view.tileSize * (this.view.tileNum+this.selectorY);     // y size of world (pixels)
        return [this.worldLength, this.worldWidth, this.selectorY];
    }
    getPhaserViewParam() {
        let param = this.calculateViewParam();
        this.phaserViewParam = {
            worldLength: param[0],
            worldWidth: param[1],
            selectorY: param[2],
            tileSize: this.view.tileSize,
            tileNum: this.view.tileNum,
            tileMap: this.model.tileMap,
            includeItem: this.includeItem,
        }
        // console.log(this.phaserViewParam);
        return this.phaserViewParam;
    }

    updateView() {
        switch(this.viewType){
            case 'Phaser':
                this.view.getInputs();
                this.model = new TileMapModel(this.view.tileSize, this.subset, this.view.tileNum, this.view.tileNum, this.tileJSON, this.tile_rule, this.item_rule, this.num_items);
                let phaserParam = this.getPhaserViewParam();
                // console.log(this.model.tileMap)
                this.displayView = this.view.updatePhaserView(phaserParam);
                break;
            case 'Babylon':
                this.view.displayBabylonView;
                break;
        }
    }

    checkModelOutput() {
        if(this.model == undefined) {
            
        }
    }

    // choose display type
    displayView() {
        switch(this.viewType){
            case 'Phaser':
                let phaserParam = this.getPhaserViewParam();
                this.displayView = this.view.displayPhaserView(phaserParam);
                break;
            case 'Babylon':
                this.view.displayBabylonView;
                break;
        }
        return null;
    }
}

var wfcController = new Controller('Phaser',test_json, "item", false, true, null,null, 2);
wfcController.displayView();

var numButton = document.getElementById("numButton");
numButton.addEventListener("click", function(){
    wfcController.updateView();
});

var exportButton = document.getElementById("exportButton");
exportButton.addEventListener("click", function(){
    wfcController.updateTileMap();
    var json_to_file = wfcController.getTile2DJSON();

    let a = document.createElement("a");
    let json_string = JSON.stringify(json_to_file, null, 4);
    let file = new Blob([json_string], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'testJson.json';
    a.click(); // wow what a terrible hack.
});

var testButton = document.getElementById("testRuns");
testButton.addEventListener("click", function(){
    console.log('Weighted Choosing Test')
    for(let i = 0; i<50; i++) {
        numButton.click();
    }
    console.log('done')
});

var updateButton = document.getElementById("updateButton");
updateButton.addEventListener("click", function(){
    wfcController.getTilesUpdated();
    wfcController.updateTileMap();
});

var updateButton = document.getElementById("itemToggle");
updateButton.addEventListener("click", function(){
    if (wfcController.includeItem == true) {
        wfcController.includeItem = false;
    } else {
        wfcController.includeItem = true;
    }
    wfcController.itemToggle();   
    
});