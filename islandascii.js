function getAsciiImg(island) {

    const weathers = ["sun", "rain", "snow", "cold", "endgame"];

    
    let penguinpos = [];
    let fishpos = [];
    const shapes = ["","Fat","Fit","Slim","Lean"]
    const activities = ["","Eating","Fishing","Loving","Diging","Filling"]
    const hunger = ["#####", ".####", "..###", "...##","....#","....."]
    const health = ["-----", "----+", "---++", "--+++","-++++","+++++" ]
    const eyes = ["   "," oo "," ôô "," öö "," @@ "," ©© "," °° "," õõ "," 88 "," 99 "," oo "," oo "]
    const fishEyes = ["    ","><o>","><ô>","><ö>","><@>","><©>","><°>","><õ>","><8>","><9>","><o>","><+>"]
    const actImg = ["(\\/)","(<>)","()/|","(<3)","()-■","(##)"]
    const acts = ["═╬╬═","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬","╬══╬"];
    const lineNum = ["1","2","3","4","5","6","7","8","9","A","B","C"]
    const food = "©©©©©©©©";
    const tiles = "≡≡≡≡≡≡≡≡";
    for (let h = 0; h < island.sizeH; h++) {
        let linep = [];
        let linef = [];
        for (let l = 0; l < island.sizeL; l++) {
        linep.push[0];
        linef.push[0];
        }
        penguinpos.push(linep);
        fishpos.push(linef);
    }

    let top =
        "|" +
        (" " + island.name.toUpperCase() + " (" + island.id + ") " + (island.running?Math.floor(island.year):"end") + " " + weathers[island.weather] + " T:" + island.tiles + " F:" + island.food + "                                                     ").substring(
        0,
        island.sizeH * 4
        ) +
        "|";
    let head =
        "+" +
        ("--1---2---3---4---5---6---7---8---9---A---B---C-------------------------------------------").substring(0,island.sizeH * 4) + "+"; 
    let mid =
        "+" +
        ("---------------------------------------------------------------------------------------").substring(0,island.sizeH * 4) + "+"; 

    let side = ("---------------------------------------------------------------------------------------").substring(0,island.sizeH * 3 + 1) + "+"; 

        let results = [""];
    results.push(mid + side );
    results.push(top + " PENGUINS                                                             ".substring(0,island.sizeH * 3 + 1) + "|");
    results.push(head + side );

    let penglist = [""];
    let pengCnt = 0;

    let cnt = 0;
    island.penguins.forEach((penguin) => {
        if (penguin.alive) {
        cnt +=1;
        var activity = 0;
        if (penguin.eating > 0) {
            activity = 1;
        } else if (penguin.fishTime > 0) {
            activity = 2;
        } else if (penguin.loving > 0) {
            activity = 3;
        } else if (penguin.digTime > 0) {
            activity = 4;
        } else if (penguin.fillTime > 0) {
            activity = 5;
        }        
        penguinpos[penguin.hpos][penguin.lpos] = cnt;
        var status = penguin.gender.substring(0,1) + "/" + Math.floor(penguin.age) 
        const hungryBar = hunger[Math.floor(penguin.hungry/20)]
        const healthBar = health[Math.floor(penguin.wealth/20)]
        let line = `${eyes[cnt]}${penguin.name} ${status} ${hungryBar} ${healthBar} ${activity > 0? activities[activity]:penguin.strategyShort}                                `
        line = line.substring(0,island.sizeH * 3 ) + ' |';
        acts[cnt] = actImg[activity];
        penglist.push(line);
        pengCnt++;
        }
    });

    let fishlist = [""];
    let fishCnt = 1;

    island.fishes.forEach((fish) => {

        if (fish.onHook) {
        fishpos[fish.hpos][fish.lpos] = 11;
        } else {
        fishpos[fish.hpos][fish.lpos] = fishCnt;;
        }

        let line = ` ${fish.onHook?'<>< ':fishEyes[fishCnt]} h=${fish.hpos} l=${fish.lpos} hook=${fish.hookAge}                                                  `
        line = line.substring(0,island.sizeH * 3 ) + ' |';
        fishlist.push(line);
        fishCnt++;
    })

    let lands1 = [
        "    ",
        "::::",
        "::::",
        "::::",
        "::::",
        "::::",
        "::::",
        "::::",
        "::::",
        "::::",
    ];
    let lands2 = [
        "    ",
        "::::",
        "::::",
        "::::",
        "::::",
        "::::",
        "::::",
        "::::",
        "::::",
        "::::",
    ];

    let ice1 = [
        "....",
        "....",
        "....",
        "....",
        "....",
        "....",
        "....",
        "....",
        "....",
    ];
    let ice2 = [
        "....",
        "....",
        "....",
        "....",
        "....",
        "....",
        "....",
        "....",
        "....",
    ];
    let iceblock = [
        ".",
        ".",
        ".",
        ".",
        ".",
        ".",
        ".",
        ".",
        "."
    ];

    let curPeng = 1;
    let hasPenguins = true;
    let curFish = 1;
    for (let h = 0; h < island.sizeH; h++) {
        let line1 = lineNum[h];
        let line2 = "|";
        for (let l = 0; l < island.sizeL; l++) {
        if (penguinpos[h][l] > 0) {
            line1 += `${eyes[penguinpos[h][l]]}`;
            line2 += acts[penguinpos[h][l]];
        } else if (fishpos[h][l] > 0) {
            line1 += `${fishEyes[fishpos[h][l]]}`;
            line2 += "    ";
        } else {
            let land = island.territory[h][l];
            if (land.hasFood) {
            if (land.type ==1) {
                let ice = Math.floor(land.conf / 2);
                line1 += "><x>";
                line2 += ice2[ice];
            } else {
                line1 += "><x>";
                line2 += lands2[land.type];
            }    
            } else if (land.hasIce) {
            if (land.type ==1) {
                let ice = Math.floor(land.conf / 2);
                line1 += iceblock[ice] + "╔╗" + iceblock[ice];
                line2 += iceblock[ice] + "╚╝" + iceblock[ice];    
            } else {
                line1 += ":╔╗:";
                line2 += ":╚╝:";
            }    
            } else if (land.isFillTarget) {
            line1 += " /\\ " ;
            line2 += " \\/ " ;    
            } else if (land.hasGarbage) {
            line1 += " °° " ;
            line2 += " °° " ;    
            } else if (land.hasCross) {
            line1 += " ++ ";
            line2 += "(--)";
            } else {
            if (land.type === 1) {
                let ice = Math.floor(land.conf / 2);
                line1 += ice1[ice];
                line2 += ice2[ice];
            } else {
                line1 += lands1[land.type];
                line2 += lands2[land.type];
            }
            }
        }
        }

        if(hasPenguins) {
        if(curPeng <= pengCnt) { 
            results.push(line1 + "|" + penglist[curPeng++]);
        } else if (curPeng++ == pengCnt + 1){
            results.push(line1 + "+" + side );
            hasPenguins=false;
        } else {  
            results.push(line1 + "|" );
        }

        if(curPeng <= pengCnt) { 
            results.push(line2 + "|" + penglist[curPeng++]);
        } else if (curPeng++ == pengCnt + 1){
            results.push(line2 + "+" + side );  
            hasPenguins=false;
        } else {
            results.push(line2 + "|" );
        } 
        } else {
        if(curFish < fishCnt) { 
            results.push(line1 + "|" + fishlist[curFish++]);
        } else if (curFish++ == fishCnt){
            results.push(line1 + "+" + side );
        } else {  
            results.push(line1 + "|" );
        }

        if(curFish < fishCnt) { 
            results.push(line2 + "|" + fishlist[curFish++]);
        } else if (curFish++ == fishCnt){
            results.push(line2 + "+" + side );  
        } else {
            results.push(line2 + "|" );
        }        
        }


    }

    results.push(mid);
    return results;
}


// now we export the class, so other modules can create Penguin objects
module.exports = {
    getAsciiImg,
}
