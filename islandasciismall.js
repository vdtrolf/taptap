const getEnd = (anId) => {
    let str = anId.toString();
    return str.substring(str.length - 3)  
}

function getSmallAsciiImg(island) {

    const weathers = ["sun", "rain", "snow", "cold", "endgame"];

    let penguinpos = [];
    let fishpos = [];
    const shapes = ["","Fat","Fit","Slim","Lean"]
    const activities = ["","Eat","Fish","Love","Dig","Fill"]
    const hunger = ["#####", ".####", "..###", "...##","....#","....."]
    const health = ["-----", "----+", "---++", "--+++","-++++","+++++" ]
    const eyes = [" ","❶❶","➁➁","➂➂","➃➃","➄➄","➅➅","➆➆","➇➇","➈➈","➉➉","❶❶"]
    const symbol = [" ","①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪"]
    const fishEyes = ["  ",">o",">ô",">ö",">@",">©",">°",">õ",">e",">a",">o",">o"]
    const actImg = ["","₪","|","♥","⚒","#"]
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

    let top = " +" + ("---------------------------------------------------------------------------------------").substring(0,island.sizeH * 4 ) + "+"; 
    let info = " |" + getEnd(island.id) + " " + island.name + " " + (island.running?Math.floor(island.year):"end") + " " + weathers[island.weather] + " T:" + island.tiles + " F:" + island.food;
    let head = " +" + ("1-2-3-4-5-6-7-8-9-A-B-C-------------------------------------------").substring(0,island.sizeH * 2) + "+"; 
    let end = " +" + ("---------------------------------------------------------------------------------------").substring(0,island.sizeH * 2 ) + "+"; 
    let side = ("---------------------------------------------------------------------------------------").substring(0,island.sizeH * 2 -1 ) + "+"; 

    let results = [""];
    results.push(top);
    results.push((info + "                                   ").substring(0,(island.sizeH * 4)+ 2) + "|");
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
        var status = (penguin.gender.substring(0,1).toUpperCase() === "M"?"♂":"♀") + Math.floor(penguin.age) + "-" + Math.floor(penguin.hungry -1) + "-" + Math.floor(penguin.wealth-1)
        const hungryBar = hunger[Math.floor(penguin.hungry/20)]
        const healthBar = health[Math.floor(penguin.wealth/20)]
        let line = `${symbol[cnt]} ${penguin.name.substring(0,6)} ${status} ${activity > 0? activities[activity]: "2" + penguin.strategyShort.substring(4)}                            ` // ${hungryBar} ${healthBar} 
        line = line.substring(0,island.sizeH * 2 - 1) + '|';
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
        "  ",
        "::",
        "::",
        "::",
        "::",
        "::",
        "::",
        "::",
        "::",
        "::",
    ];
    let lands2 = [
        "  ",
        "::",
        "::",
        "::",
        "::",
        "::",
        "::",
        "::",
        "::",
        "::",
    ];

    let ice1 = [
        "..",
        "..",
        "..",
        "..",
        "..",
        "..",
        "..",
        "..",
        "..",
    ];
    let ice2 = [
        "..",
        "..",
        "..",
        "..",
        "..",
        "..",
        "..",
        "..",
        "..",
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
        let line1 = lineNum[h] + "|";
        for (let l = 0; l < island.sizeL; l++) {
            if (penguinpos[h][l] > 0) {
                if (acts[penguinpos[h][l]].length > 0)  {
                    line1 += eyes[penguinpos[h][l]].substring(0,1) +  acts[penguinpos[h][l]];
                } else {
                    line1 += `${eyes[penguinpos[h][l]]}`;
                }
            } else if (fishpos[h][l] > 0) {
                line1 += ">e" // `${fishEyes[fishpos[h][l]]}`;
            } else {
                let land = island.territory[h][l];
                if (land.hasFood) {
                    if (land.nature ==1) {
                        line1 += ">x";
                    } else {
                        line1 += ">x";
                    }    
                } else if (land.hasIce) {
                    if (land.nature ==1) {
                        line1 += "┌┐"
                    } else {
                        line1 += "┌┐";
                    }    
                } else if (land.hasFill) {
                    line1 += "--" ;
                } else if (land.hasGarbage) {
                    line1 += "°°" ;
                } else if (land.hasCross) {
                    line1 += "++";
                } else {
                    if (land.nature === 1) {
                        let ice = Math.floor(land.smeltLevel/ 2);
                        line1 += ice1[ice];
                    } else {
                        line1 += lands1[land.nature];
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
        } else {
            results.push(line1 + "|" );
        }


    }

    results.push(end);
    return results;
}


// now we export the class, so other modules can create Penguin objects
module.exports = {
    getSmallAsciiImg,
}
