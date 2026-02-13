var data;

var mon = {
    name: "モンスター",
    size: "中型", swarm: "", cutomSize: "",
    type: "人型生物", tag: "", customType: "",
    alignment: "任意の属性", customAlignment: "",
    armorName: "", natArmorBonus: 3, shieldBonus: 0, customAc: "10",
    init: 0, customInit: "",
    hitDice: 5, customHp: "22（4d8＋4）",
    walkSpeed: 30, burrowSpeed: 0, climbSpeed: 0, swimSpeed: 0, flySpeed: 0, hover: false,
    customSpeed: "9mhiybboyuh",
    strScore: 10, dexScore: 10, conScore: 10, intScore: 10, wisScore: 10, chaScore: 10,
    saves: [false, false, false, false, false, false],
    skills: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    customSkills: "",
    damagetypes: ["", "", "", "", "", "", "", "", "", "", "", "", ""],
    customVulnerable: "", customResistant: "", customImmune: "",
    conditions: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    customConditions: "",
    gearsText: [],
    darkvision: 0, magical: false, blindsight: 0, tremorsense: 0, truesight: 0,
    customSenses: "",
    languages: [], understandsBut: "", telepathy: 0, customLanguage: "",
    cr: 1, crLair: "", customCr: "", customProf: 2,
    shortName: "", pluralName: "",
    isLegendary: false, legendaryDescription: "",
    isLair: false, lairDescription: "", lairDescriptionEnd: "",
    isMythic: false, mythicDescription: "",
    isRegional: false, regionalDescription: "", regionalDescriptionEnd: "",
    properties: [], traits: [],
    actions: [], bonusActions: [], reactions: [],
    legendaries: [], mythics: [], lairs: [], regionals: [], specialdamage: [],
    doubleColumns: false, separationPoint: 1, byFeet: true, byMeter: true
};

const LEGACY_MARKDOWN = false
const V3_MARKDOWN = true
const LEGENDARY = "LEGENDARY"
const MYTHIC = "MYTHIC"
const REGIONAL = "REGIONAL"
const LAIR = "LAIR"

// ページ読込時（更新時）
/* $(function ()に移行してみる
window.addEventListener("load", function () {
    GetVariablesFunctions.GetAllVariables();

    FormFunctions.DisableCustomSize();
    FormFunctions.DisableCustomType();
    FormFunctions.DisableCustomAlignment();
    FormFunctions.DisableCustomArmor();
    FormFunctions.DisableCustomInitiative();
    FormFunctions.DisableCustomHp();
    FormFunctions.ShowHideHoverBox();
    FormFunctions.DisableCustomSpeed();
    FormFunctions.ShowHideMagicalBox();

    UpdateStatblock();
});
*/

// データの保存
var SaveFile = () => {
    SavedData.SaveToFile();
}

// データの読込（ファイル選択ウィンドウを開く）
var LoadFile = () => {
    $("#file-upload").click();
}

// データの読込（ファイル選択後に動く）
var TryLoadFile = () => {
    SavedData.RetrieveFromFile();
}

// 画像として保存
function SaveImage() {
    const target = document.getElementById("stat-block");

    html2canvas(target, {
    scale: 2,        // 高解像度にする（重要）
    backgroundColor: null // 透明にしたい場合
    }).then(canvas => {
    const link = document.createElement("a");
    link.download = mon.name + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    });
}

// 変数からデータ・ブロックを更新する
function UpdateBlockFromVariables(moveSeparationPoint) {
    GetVariablesFunctions.GetAllVariables();
    UpdateStatblock(moveSeparationPoint);
}

// データを保存／復元する函数
var SavedData = {
    // 保存
    SaveToLocalStorage: () => localStorage.setItem("SavedData", JSON.stringify(mon)),
    
    SaveToFile: () => saveAs(new Blob([JSON.stringify(mon)], {
        type: "text/plain;charset=utf-8"
    }), mon.name + ".monster"),

    // 復元
    RetrieveFromLocalStorage: function () {
        let savedData = localStorage.getItem("SavedData");
        if (savedData != undefined)
            mon = JSON.parse(savedData);
    },

    RetrieveFromFile: function () {
        let file = $("#file-upload").prop("files")[0],
            reader = new FileReader();
        reader.onload = function (e) {
            mon = JSON.parse(reader.result);
            Populate();
        };
        reader.readAsText(file);
    },
}

// データ・ブロックを更新する
function UpdateStatblock(moveSeparationPoint) {
    // 列区切りの設定
    let separationMax = mon.traits.length + mon.actions.length + mon.bonusActions.length + mon.reactions.length - 1;
    if (mon.isLegendary)
        separationMax += (mon.legendaries.length == 0 ? 1 : mon.legendaries.length);
    if (mon.isMythic)
        separationMax += (mon.mythics.length == 0 ? 1 : mon.mythics.length);
    if (mon.isLair)
        separationMax += (mon.lairs.length == 0 ? 1 : mon.lairs.length);
    if (mon.isRegional)
        separationMax += (mon.regionals.length == 0 ? 1 : mon.regionals.length);
    if (mon.separationPoint == undefined)
        mon.separationPoint = Math.floor(separationMax / 2);
    if (moveSeparationPoint != undefined)
        mon.separationPoint = MathFunctions.Clamp(mon.separationPoint + moveSeparationPoint, 0, separationMax);

    // 一旦保存
    SavedData.SaveToLocalStorage();

    // 1列 or 2列
    let statBlock = $("#stat-block");
    mon.doubleColumns ? statBlock.addClass('wide') : statBlock.removeClass('wide');

    // 名前
    $("#monster-name").html(StringFunctions.RemoveHtmlTags(mon.name));
    
    // サイズ、分類、属性
    $("#monster-type").html(StringFunctions.FormatString(StringFunctions.RemoveHtmlTags(StringFunctions.GetCreatureHeading())));

    // AC
    $("#ac").html(StringFunctions.FormatString(StringFunctions.RemoveHtmlTags(MathFunctions.GetAc(mon.armorName, mon.natArmorBonus, mon.shieldBonus, MathFunctions.PointsToBonus(mon.dexScore)))));

    // イニシアチブ
    $("#initiative").html(StringFunctions.FormatString(StringFunctions.RemoveHtmlTags(StringFunctions.GetInit())));

    // HP
    $("#hit-points").html(StringFunctions.FormatString(StringFunctions.RemoveHtmlTags(StringFunctions.GetHp())));
    
    // 移動速度
    $("#speed").html(StringFunctions.FormatString(StringFunctions.RemoveHtmlTags(StringFunctions.GetSpeed())));

    // 能力値
    let setPts = (stat, pts, saveProf) => {
        let mod = MathFunctions.PointsToBonus(pts);
        let profBonus = mon.customCr ? mon.customProf : MathFunctions.GetProfBonus(mon.cr);
        $("#" + stat + "pts").html(StringFunctions.RemoveHtmlTags(pts));
        $("#" + stat + "bns").html(StringFunctions.RemoveHtmlTags(StringFunctions.BonusFormat(mod)));
        $("#" + stat + "sts").html(StringFunctions.RemoveHtmlTags(StringFunctions.BonusFormat(mod + saveProf ? profBonus: 0)));
    };
    setPts("str", mon.strScore, mon.saves[0]);
    setPts("dex", mon.dexScore, mon.saves[1]);
    setPts("con", mon.conScore, mon.saves[2]);
    setPts("int", mon.intScore, mon.saves[3]);
    setPts("wis", mon.wisScore, mon.saves[4]);
    setPts("cha", mon.chaScore, mon.saves[5]);

    // その他プロパティ 2次元配列で返ってくる
    let propertiesDisplayArr = StringFunctions.GetPropertiesDisplayArr();

    // 全プロパティ（脅威度以外）を表示
    let propertiesDisplayList = [];
    propertiesDisplayList.push(StringFunctions.MakePropertyHTML(propertiesDisplayArr[0], true));
    for (let i = 1; i < propertiesDisplayArr.length; i++)
        propertiesDisplayList.push(StringFunctions.MakePropertyHTML(propertiesDisplayArr[i]));
    $("#properties-list").html(propertiesDisplayList.join(""));

    // 脅威度
    let crDisplay = StringFunctions.GetCr();
    if (crDisplay && crDisplay.length > 0) {
        $("#challenge-rating-line").show();
        $("#challenge-rating").html(StringFunctions.FormatString(StringFunctions.RemoveHtmlTags(crDisplay)));
    }
    else
        $("#challenge-rating-line").hide();

    // 特徴、アクション
    let traitsHTML = [];

    if (mon.traits.length > 0) AddToTraitList(traitsHTML, mon.traits, "<h3>特徴</h3>");
    if (mon.actions.length > 0) AddToTraitList(traitsHTML, mon.actions, "<h3>アクション</h3>");
    if (mon.bonusActions.length > 0) AddToTraitList(traitsHTML, mon.bonusActions, "<h3>ボーナス・アクション</h3>");
    if (mon.reactions.length > 0) AddToTraitList(traitsHTML, mon.reactions, "<h3>リアクション</h3>");
    if (mon.isLegendary && (mon.legendaries.length > 0 || mon.legendariesDescription.length > 0))
        AddToTraitList(traitsHTML, mon.legendaries, mon.legendariesDescription == "" ?
            "<h3>伝説的アクション</h3><div class='property-block'></div>" :
            ["<h3>伝説的アクション</h3><div class='property-block'>", StringFunctions.FormatString(ReplaceTags(StringFunctions.RemoveHtmlTags(mon.legendariesDescription))), "</div>"], true);
    if (mon.isMythic && mon.isLegendary && (mon.mythics.length > 0 || mon.mythicDescription.length > 0))
        AddToTraitList(traitsHTML, mon.mythics, mon.mythicDescription == "" ?
            "<h3>神話的アクション</h3><div class='property-block'></div>" :
            ["<h3>神話的アクション</h3><div class='property-block'>", StringFunctions.FormatString(ReplaceTags(StringFunctions.RemoveHtmlTags(mon.mythicDescription))), "</div>"], true);    
    if (mon.isLair && mon.isLegendary && (mon.lairs.length > 0 || mon.lairDescription.length > 0 || mon.lairDescriptionEnd.length > 0)) {
        AddToTraitList(traitsHTML, mon.lairs, mon.lairDescription == "" ?
            "<h3>住処アクション</h3><div class='property-block'></div>" :
            ["<h3>住処アクション</h3><div class='property-block'>", StringFunctions.FormatString(ReplaceTags(StringFunctions.RemoveHtmlTags(mon.lairDescription))), "</div>"], false, true);
        traitsHTML.push("" + StringFunctions.FormatString(ReplaceTags(StringFunctions.RemoveHtmlTags(mon.lairDescriptionEnd))));
    }
    if (mon.isRegional && mon.isLegendary && (mon.regionals.length > 0 || mon.regionalDescription.length > 0 || mon.regionalDescriptionEnd.length > 0)) {
        AddToTraitList(traitsHTML, mon.regionals, mon.regionalDescription == "" ?
            "<h3>環境に及ぼす効果</h3><div class='property-block'></div>" :
            ["<h3>環境に及ぼす効果</h3><div class='property-block'>", StringFunctions.FormatString(ReplaceTags(StringFunctions.RemoveHtmlTags(mon.regionalDescription))), "</div>"], false, true);
        traitsHTML.push("" + StringFunctions.FormatString(ReplaceTags(StringFunctions.RemoveHtmlTags(mon.regionalDescriptionEnd))));
    }

    // 特徴を追加、ブロックの幅（1列or2列）を考慮する
    let leftTraitsArr = [],
        rightTraitsArr = [],
        separationCounter = 0;
    for (let index = 0; index < traitsHTML.length; index++) {
        let trait = traitsHTML[index],
            raiseCounter = true;
        if (trait[0] == "*") {
            raiseCounter = false;
            trait = trait.substr(1);
        }
        (separationCounter < mon.separationPoint ? leftTraitsArr : rightTraitsArr).push(trait);
        if (raiseCounter)
            separationCounter++;
    }
    if (!rightTraitsArr) rightTraitsArr[0] = rightTraitsArr[0].replace("<h3>","<h3 style='margin: 0;'>");
    $("#traits-list-left").html(leftTraitsArr.join(""));
    $("#traits-list-right").html(rightTraitsArr.join(""));

    // 列の数に応じて分離線を表示
    FormFunctions.ShowSeparatorInput();
}

// UpdateStatblockが特徴・アクションに使う関数
function AddToTraitList(traitsHTML, traitsArr, addElements, isLegendary = false, isLairRegional = false) {

    // 特定の要素を配列の先頭に追加、通常はヘッダ
    if (addElements != undefined) {
        if (Array.isArray(addElements)) {
            for (let index = 0; index < addElements.length; index++)
                traitsHTML.push("*" + addElements[index]);
        } else
            traitsHTML.push("*" + addElements);
    }

    // 伝説的アクションと住処・環境アクションのフォーマット化には少し差異がある
    for (let index = 0; index < traitsArr.length; index++) {
        if (isLegendary) {
            traitsHTML.push(StringFunctions.MakeTraitHTMLLegendary(traitsArr[index].name, ReplaceTags(traitsArr[index].desc)));
        } else if (isLairRegional) {
            traitsHTML.push(StringFunctions.MakeTraitHTMLLairRegional(traitsArr[index].name, ReplaceTags(traitsArr[index].desc)));
        } else {
            traitsHTML.push(StringFunctions.MakeTraitHTML(traitsArr[index].name, ReplaceTags(traitsArr[index].desc)));
        }
    }
}

// 特徴、アクション内のタグの置換
function ReplaceTags(desc) {
    const bracketExp = /\[(.*?)\]/g,    // [??] の中身が↓
        damageExp = /\d*d\d+/,          // ?d??
        bonusExp = /^[+-] ?(\d+)$/;     // +??
    let matches = [], match = null;
    while ((match = bracketExp.exec(desc)) != null)
        matches.push(match);

    matches.forEach(function (match) {
        const GetPoints = (pts) => data.abilityNames.includes(pts) ? MathFunctions.PointsToBonus(mon[pts + "Score"]) : null;
        let readString = match[1].toLowerCase().replace(/ +/g, ' ').trim();

        if (readString.length > 0) {
            if (readString == "mon") {
                if (mon.shortName && mon.shortName.length > 0)
                    desc = desc.replace(match[0], mon.shortName);
                else
                    desc = desc.replace(match[0], mon.name);
            }
            else if (readString == "mons") {
                if (mon.pluralName && mon.pluralName.length > 0)
                    desc = desc.replace(match[0], mon.pluralName);
                else
                    desc = desc.replace(match[0], mon.name);
            }
            else {
                let readPosition = 0,
                    type = null,
                    statPoints = GetPoints(readString.substring(0, 3)),
                    bonus = 0,
                    roll = null;

                // 能力値修正を取得
                if (statPoints != null) {
                    bonus = statPoints;
                    readPosition = 3;
                    type = "stat";
                    if (readString.length > 3) {
                        if (readString.substring(3, 7) == " atk") {
                            bonus += CrFunctions.GetProf();
                            readPosition = 7;
                            type = "atk";
                        } else if (readString.substring(3, 8) == " save") {
                            bonus += CrFunctions.GetProf() + 8;
                            readPosition = 8;
                            type = "save";
                        }
                    }

                    if (readPosition < readString.length) {
                        if (readString[readPosition] == " ")
                            readPosition++;
                        else
                            type = "error";
                    }
                }

                // ダイスを取得
                if ((type == null || type == "stat") && readPosition < readString.length) {
                    let nextSpace = readString.indexOf(" ", readPosition),
                        nextToken = nextSpace >= 0 ? readString.substring(readPosition, nextSpace) : readString.substring(readPosition);

                    if (damageExp.test(nextToken)) {
                        roll = nextToken;
                        readPosition += nextToken.length;
                        type = "dmg";

                        if (readPosition < readString.length) {
                            if (readString[readPosition] == " ")
                                readPosition++;
                            else
                                type = "error";
                        }
                    }
                }

                // ボーナスを取得
                if (type != "error" && readPosition < readString.length) {
                    let nextToken = readString.substring(readPosition),
                        bonusMatch = nextToken.match(bonusExp);
                    if (bonusMatch)
                        bonus += nextToken[0] == "-" ? -parseInt(bonusMatch[1]) : parseInt(bonusMatch[1]);
                    else
                        type = "error";
                }

                // 文字列を作成
                if (type != null && type != "error") {
                    let replaceString = null;
                    switch (type) {
                        case "stat":
                        case "atk":
                            replaceString = StringFunctions.BonusFormat(bonus);
                            break;
                        case "save":
                            replaceString = bonus;
                            break;
                        case "dmg":
                            let splitRoll = roll.split("d"),
                                multiplier = splitRoll[0].length > 0 ? parseInt(splitRoll[0]) : 1,
                                dieSize = parseInt(splitRoll[1]);
                            replaceString = Math.max(Math.floor(multiplier * ((dieSize + 1) / 2) + bonus), 1) + "（" + multiplier + "d" + dieSize;
                            replaceString += bonus > 0 ?
                                "＋" + bonus : bonus < 0 ?
                                    "－" + -bonus : "";
                            replaceString += "）";
                            break;
                    }
                    desc = desc.replace(match[0], replaceString);
                }
            }
        }
    });

    return desc;
}

// Homebrewery/GM Binder用マークダウン
function TryMarkdown() {
    let markdownWindow = window.open();
    let markdown = ['<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>', mon.name, '</title><link rel="shortcut icon" type="image/trash-icon" href="./files/img/favicon.ico" /></head><body>'];
    
    markdown.push(
        "<h2>Homebrewery V3</h2>",
        BuildMarkdown(V3_MARKDOWN),
        "<h2>Homebrewery (Legacy)/GM Binder Markdown</h2>",
        BuildMarkdown(LEGACY_MARKDOWN));


    markdown.push("</body></html>");

    markdownWindow.document.write(markdown.join(""));
}

function BuildMarkdown(isV3Markdown) {
    let markdownLines = [];

    if (isV3Markdown) {
        markdownLines.push(`{{monster,frame${mon.doubleColumns ? ",wide" : ""}`);
    }
    else {
        if (mon.doubleColumns) {
            markdownLines.push("___");  
        }
        markdownLines.push("___");
    }

    markdownLines.push(
        `## ${mon.name}`,
        `*${mon.size} ${mon.type}${mon.tag != "" ? ` (${mon.tag})`  : ""}, ${mon.alignment}*`,
        `___`,
        PrintMarkdownProperty(isV3Markdown, "AC：", StringFunctions.FormatString(StringFunctions.GetArmorData())),
        PrintMarkdownProperty(isV3Markdown, "hp：", StringFunctions.GetHp()), 
        PrintMarkdownProperty(isV3Markdown, "移動速度：", StringFunctions.GetSpeed()),
        `___`);
    AddMarkdownAttributesTable(markdownLines);
    markdownLines.push("___");

    let propertiesDisplayArr = StringFunctions.GetPropertiesDisplayArr();

    for (let index = 0; index < propertiesDisplayArr.length; index++) {
        markdownLines.push(
            PrintMarkdownProperty(isV3Markdown, 
            propertiesDisplayArr[index].name, 
            Array.isArray(propertiesDisplayArr[index].arr) ? propertiesDisplayArr[index].arr.join("、") : propertiesDisplayArr[index].arr));
    }

    markdownLines.push(
        PrintMarkdownProperty(isV3Markdown, "脅威度：", mon.cr == "*" ? mon.customCr : `${mon.cr} (${data.crs[mon.cr].xp}XP)`),
        "___");

    AddMarkdownTraitSection(markdownLines, isV3Markdown, null, mon.traits);
    AddMarkdownTraitSection(markdownLines, isV3Markdown, "アクション", mon.actions);
    AddMarkdownTraitSection(markdownLines, isV3Markdown, "ボーナス・アクション", mon.bonusActions);
    AddMarkdownTraitSection(markdownLines, isV3Markdown, "リアクション", mon.reactions);

    if (mon.isLegendary) {
        AddMarkdownTraitSection(markdownLines, isV3Markdown, "伝説的アクション", mon.legendaries, mon.legendariesDescription, null, LEGENDARY);
        if (mon.isMythic) AddMarkdownTraitSection(markdownLines, isV3Markdown, "神話的アクション", mon.mythics, mon.mythicDescription, null, MYTHIC);
        if (mon.isLair) AddMarkdownTraitSection(markdownLines, isV3Markdown, "住処アクション", mon.lairs, mon.lairDescription, mon.lairDescriptionEnd, LAIR);
        if (mon.isRegional) AddMarkdownTraitSection(markdownLines, isV3Markdown, "環境に及ぼす効果", mon.regionals, mon.regionalDescription, mon.regionalDescriptionEnd, REGIONAL);
    }

    if (isV3Markdown) {
        markdownLines.push("}}");
    }
    else 
    {
        LegacyMarkdownFormating(markdownLines);
    }

    return ConvertMarkdownToHtmlString(markdownLines);
}

function PrintMarkdownProperty(isV3Markdown, name, value) {
    if (isV3Markdown) {
        return `**${name}** :: ${value}`;
    }
    else {
        return `- **${name}** ${value}`;
    }
}

function AddMarkdownAttributesTable(markdown) {
    markdown.push(
        `|str|dex|con|int|wis|cha|`,
        `|:---:|:---:|:---:|:---:|:---:|:---:|`,
        `|${mon.strScore} (${StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.strScore))})|` +
        `${mon.dexScore} (${StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.dexScore))})|` +
        `${mon.conScore} (${StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.conScore))})|` +
        `${mon.intScore} (${StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.intScore))})|` +
        `${mon.wisScore} (${StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.wisScore))})|` +
        `${mon.chaScore} (${StringFunctions.BonusFormat(MathFunctions.PointsToBonus(mon.chaScore))})|`);
}

function AddMarkdownTraitSection(markdownLines, isV3Markdown, sectionTitle, traitArr, sectionHeader = null, sectionEnd = null, formatOptions = "") {
    if (traitArr.length == 0 && !sectionHeader && !sectionEnd)
    {
        return;
    }
    
    let traitDiv = isV3Markdown ? ":" : "";
    let legendary = formatOptions === LEGENDARY;
    let lairOrRegional = formatOptions === LAIR || formatOptions === REGIONAL;

    if (sectionTitle) markdownLines.push(`### ${sectionTitle}`);
    if (sectionHeader) markdownLines.push(ReplaceTags(sectionHeader), traitDiv);

    if (traitArr.length != 0) {
        for (let index = 0; index < traitArr.length; index++) {
            let desc = ReplaceTags(traitArr[index].desc)
                .replace(/(\r\n|\r|\n)\s*(\r\n|\r|\n)/g, '\n>\n')
                .replace(/(\r\n|\r|\n)>/g, `\&lt;br&gt;<br>`)
                .replace(/(\r\n|\r|\n)/g, `\&lt;br&gt;<br> &amp;nbsp;&amp;nbsp;&amp;nbsp;&amp;nbsp;`);
            
            let traitString = (legendary ? "**" : (lairOrRegional ? "* " : "***")) +
            (lairOrRegional ? "" : traitArr[index].name) +
            (legendary ? ".** " : lairOrRegional ? "" : (".*** ")) +
            desc;

            traitString.split("<br>").forEach(line => markdownLines.push(line))
            if (index + 1 < traitArr.length)
            {
                markdownLines.push(traitDiv);
            }
        }
    }

    if (sectionEnd && traitArr.length != 0) markdownLines.push(traitDiv);
    if (sectionEnd) markdownLines.push(ReplaceTags(sectionEnd));
}

function LegacyMarkdownFormating(markdownLines) {
    // Append each line with a >
    // Skip first 1 or 2 lines depending if its wide frame or not
    let startingIndex = mon.doubleColumns ? 2 : 1; 

    for (let index = startingIndex; index < markdownLines.length; index++)
    {
        markdownLines[index] = `> ${markdownLines[index]}`;
    }
}

function ConvertMarkdownToHtmlString(markdownLines) {
    // Add line breaks and code tags
    let builtLines = [];
    
    markdownLines.forEach(line => {
        line.split("<br>").forEach(subLine => {
            builtLines.push(`${subLine}<br>`);
        });
    });

    return `<code>${builtLines.join("")}</code>`
}

// フォーム上の値を設定
var FormFunctions = {
    // 変数をフォームに設定
    SetForms: function () {
        console.log(mon) //mon.customSpeedだけ変
        // 列ラジオボタン
        $("#1col-input").prop("checked", !mon.doubleColumns);
        $("#2col-input").prop("checked", mon.doubleColumns);

        // 距離の表記
        $("#by-meter-input").prop("checked", mon.byMeter);
        $("#by-feet-input").prop("checked", mon.byFeet);

        // 名前
        $("#name-input").val(mon.name);

        // サイズ
        $("#size-input").val(mon.size);
        $("#swarm-check").prop("checked", mon.swarm);
        $("#swarm-input").val(mon.swarm);
        $("#swarm-input").toggle(mon.swarm != null);
        $("#custom-size-check").prop("checked", mon.customSize);
        $("#custom-size-input").val(mon.customSize ? mon.customSize : "中型");
        $("#custom-size-input").prop("disabled", !mon.customSize);

        // クリーチャー分類
        $("#type-input").val(mon.type);
        $("#tag-input").val(mon.tag);
        $("#custom-type-check").prop("checked", mon.customType);
        $("#custom-type-input").val(mon.customType ? mon.customType : "人型生物");
        $("#custom-type-input").prop("disabled", !mon.customType);

        // 属性
        $("#alignment-input").val(mon.alignment);
        $("#custom-alignment-check").prop("checked", mon.customAlignment);
        $("#custom-alignment-input").val(mon.customAlignment ? mon.customAlignment : "真なる中立");
        $("#custom-alignment-input").prop("disabled", !mon.customAlignment);

        // 脅威度
        $("#cr-input").val(mon.cr);
        $("#custom-cr-check").prop("checked", mon.customCr);
        $("#custom-cr-input").val(mon.customCr ? mon.customCr : "0（0XP；習熟ボーナス＋[PROF]）");
        $("#custom-cr-input").prop("disabled", !mon.customCr);
        $("#custom-prof-input").val(mon.customCr ? mon.profNum : 2);
        $("#custom-prof-input").prop("disabled", !mon.customCr);

        // Stats
        this.SetStatForm("str", mon.strScore);
        this.SetStatForm("dex", mon.dexScore);
        this.SetStatForm("con", mon.conScore);
        this.SetStatForm("int", mon.intScore);
        this.SetStatForm("wis", mon.wisScore);
        this.SetStatForm("cha", mon.chaScore);

        // セーヴ
        for (let i = 0; i < data.abilities.length; i++) {
            let abilityName = data.abilities[i].name;
            this.SetSaveForm(abilityName, mon.saves[i]);
        };

        // AC
        $("#armor-input").val(mon.armorName);
        $("#nat-armor-input").val(mon.natArmorBonus);
        $("#nat-armor-prompt").toggle(mon.armorName == "外皮");
        $("#shield-input").prop("checked", (mon.shieldBonus > 0 ? true : false));
        $("#custom-ac-check").prop("checked", mon.customAc);
        $("#custom-ac-input").val(mon.customAc ? mon.customAc : "10");
        $("#custom-ac-input").prop("disabled", !mon.customAc);
        FormFunctions.FillAc();

        // イニシアチブ
        $("input[name='init'][value=" + mon.init + "]").prop("checked", true);
        $("#custom-init-check").prop("checked", mon.customInit);
        $("#custom-init-input").val(mon.customInit ? mon.customInit: "＋0（10）");
        $("#custom-init-input").prop("disabled", !mon.customInit);
        FormFunctions.FillInit();

        // HP
        $("#hitdice-input").val(mon.hitDice);
        $("#custom-hp-check").prop("checked", mon.customHp);
        $("#custom-hp-input").val(mon.customHp ? mon.customHp : "4（1d8）");
        $("#custom-hp-input").prop("disabled", !mon.customHp);
        FormFunctions.FillHp();

        // 移動速度
        $("#walk-ft-input").val(mon.walkSpeed);
        $("#walk-m-input").val(MathFunctions.Feet2Meter(mon.walkSpeed));
        $("#burrow-ft-input").val(mon.burrowSpeed);
        $("#burrow-m-input").val(MathFunctions.Feet2Meter(mon.burrowSpeed));
        $("#climb-ft-input").val(mon.climbSpeed);
        $("#climb-m-input").val(MathFunctions.Feet2Meter(mon.climbSpeed));
        $("#swim-ft-input").val(mon.swimSpeed);
        $("#swim-m-input").val(MathFunctions.Feet2Meter(mon.swimSpeed));
        $("#fly-ft-input").val(mon.flySpeed);
        $("#fly-m-input").val(MathFunctions.Feet2Meter(mon.flySpeed));
        $("#hover-input").prop("checked", mon.hover);
        //$("#hover-box-note").toggle(mon.flySpeed > 0);
        $("#custom-speed-check").prop("checked", mon.customSpeed);
        $("#custom-speed-input").val(mon.customSpeed ? mon.customSpeed : "30㌳（9m）");
        $("#custom-speed-input").prop("disabled", !mon.customSpeed);
    
        // 技能
        for (let i = 0; i < data.skills.length; i++) {
            let skillName = data.skills[i].name;
            this.SetSkillForm(skillName, mon.skills[i]);
        };
        $("#custom-skills-check").prop("checked", mon.customSkills);
        $("#custom-skills-input").val(mon.customSkills ? mon.customSkills : "〈知覚〉＋0");
        $("#custom-skills-input").prop("disabled", !mon.customSkills);

        // ダメージ種別
        for (let i = 0; i < data.damagetypes.length; i++) {
            let damagetype = data.damagetypes[i];
            this.SetDamagetypeForm(damagetype, mon.damagetypes[i]);
        };
        let customDamagetype = !(mon.customVulnerable == "" && mon.customResistant == "" && mon.customImmune == "");
        $("#custom-damagetypes-check").prop("checked", customDamagetype);
        $("#custom-vulnerable-input").val(mon.customVulnerable);
        $("#custom-vulnerable-input").prop("disabled", !customDamagetype);
        $("#custom-resistant-input").val(mon.customResistant ? mon.customResistant : "［毒］");
        $("#custom-resistant-input").prop("disabled", !customDamagetype);
        $("#custom-immune-input").val(mon.customImmune);
        $("#custom-immune-input").prop("disabled", !customDamagetype);

        // 状態
        for (let i = 0; i < data.conditions.length; i++) {
            let conditionName = data.conditions[i];
            this.SetConditionForm(conditionName, mon.conditions[i]);
        };
        $("#custom-conditions-check").prop("checked", mon.customConditions);
        $("#custom-conditions-input").val(mon.customConditions ? mon.customConditions : "毒状態");
        $("#custom-conditions-input").prop("disabled", !mon.customConditions);

        // 装備
        $("#gears-text-input").val(mon.gearsText);
        $("#gears-helper-checkbox").prop("checked", false);
        $("#gears-helper").toggle(false);

        // 感覚
        $("#darkvision-ft-input").val(mon.darkvision);
        $("#darkvision-m-input").val(MathFunctions.Feet2Meter(mon.darkvision));
        $("#blindsigh-ft-input").val(mon.blindsight);
        $("#blindsight-m-input").val(MathFunctions.Feet2Meter(mon.blindsight));
        $("#tremorsense-ft-input").val(mon.tremorsense);
        $("#tremorsense-m-input").val(MathFunctions.Feet2Meter(mon.tremorsense));
        $("#truesight-ft-input").val(mon.truesight);
        $("#truesight-m-input").val(MathFunctions.Feet2Meter(mon.truesight));
        $("#magical-input").prop("checked", mon.magical);
        $("#custom-senses-check").prop("checked", mon.customSenses);
        $("#custom-senses-input").val(mon.customSenses ? mon.customSenses : "暗視30㌳（9m）");

        // 言語
        $("#languages-input").val("共通語");
        this.MakeDisplayList("languages", false, false);
        $("#understands-but-input").val(mon.understandsBut);
        $("#other-language-input").val("その他？種類の言語");
        $("#other-language-input").toggle(false);
        $("#telepathy-ft-input").val(mon.telepathy);
        $("#telepathy-m-input").val(MathFunctions.Feet2Meter(mon.telepathy));

        // 特徴、アクション
        $("#short-name-input").val(mon.shortName);
        $("#plural-name-input").val(mon.pluralName);

        // 伝説的？
        $("#is-legendary-input").prop("checked", mon.isLegendary);
        //this.ShowHideLegendaryCreature();
        // 神話的？
        $("#is-mythic-input").prop("checked", mon.isMythic);
        //this.ShowHideMythicCreature();
        // 住処？
        $("#has-lair-input").prop("checked", mon.isLair);
        //this.ShowHideLair();
        // 環境？
        $("#has-regional-input").prop("checked", mon.isRegional);
        //this.ShowHideRegional();

        $("#legendary-description-input").val(mon.legendaryDescription);
        $("#mythic-description-input").val(mon.mythicDescription);
        $("#lair-description-input").val(mon.lairDescription);
        $("#lair-end-description-input").val(mon.lairDescriptionEnd);
        $("#regional-description-input").val(mon.regionalDescription);
        $("#regional-end-description-input").val(mon.regionalDescriptionEnd);

        $("#trait-name-input").val("");
        $("#trait-description-input").val("");

        $("#common-trait-input").val("1");

        $("#format-helper-checkbox").prop("checked", false);
        $("#format-helper").toggle(false);

        this.MakeDisplayList("traits", false, true);
        this.MakeDisplayList("actions", false, true);
        this.MakeDisplayList("bonusActions", false, true);
        this.MakeDisplayList("reactions", false, true);
        this.MakeDisplayList("legendaries", false, true);
        this.MakeDisplayList("mythics", false, true);
        this.MakeDisplayList("lairs", false, true);
        this.MakeDisplayList("regionals", false, true);
    },

    // For setting the column radio buttons based on saved data
    ChangeColumnRadioButtons: function () {
        $("#1col-input").prop("checked", !mon.doubleColumns);
        $("#2col-input").prop("checked", mon.doubleColumns);
    },

    // 
    ChangeDistanceBy: function () {
        $("#by-meter-input").prop("checked", mon.byMeter);
        $("#by-feet-input").prop("checked", mon.byFeet);
    },

    EnableHtmlElement: function (key, enable) {
        if (key === "custom-damagetypes") {
            $("#custom-vulnerable-input").prop('disabled', !enable);
            $("#custom-resistant-input").prop('disabled', !enable);
            $("#custom-immune-input").prop('disabled', !enable);
        } else {
            $("#" + key + "-input").prop('disabled', !enable);
        };
        if (key === "custom-cr") $("#custom-prof-input").prop('disabled', !enable);
    },

    ShowHtmlElement: function (key, type, show) {
        if (type === "actions-form") {
            $("#add-" + key + "-" + "button").toggle(show);
            if (key === "legendary") { // ミスったらループしそうなので注意
                this.ShowHtmlElement("mythic", "actions-form", $("#is-mythic-input").prop("checked"));
                this.ShowHtmlElement("lair", "actions-form", $("#has-lair-input").prop("checked"));
                this.ShowHtmlElement("regional", "actions-form", $("#has-regional-input").prop("checked"));
                if (!show) {
                    this.ShowHtmlElement("mythic", "actions-form", false);
                    this.ShowHtmlElement("lair", "actions-form", false);
                    this.ShowHtmlElement("regional", "actions-form", false);
                };
            };
        };
        $("#" + key + "-" + type).toggle(show);
    },

    FillMod: function (abilityName) {
        let mod = MathFunctions.PointsToBonus($("#" + abilityName + "-input").val());
        let modText = StringFunctions.BonusFormat(mod);
        $("#" + abilityName + "-mod").html(StringFunctions.RemoveHtmlTags(modText));
    },

    FillSaveBonus: function (abilityName) {
        let mod = MathFunctions.PointsToBonus($("#" + abilityName + "-input").val());
        let prof = $("#" + abilityName + "-save-input").prop("checked");
        let profBonus;
        if ($("#custom-cr-check").prop("checked")) {
            profBonus = $("#custom-prof-input").val();
        } else {
            profBonus = MathFunctions.GetProfBonus($("#cr-input").val());
        };
        let saveBonus = mod + (prof ? profBonus : 0);
        let bonusText = StringFunctions.BonusFormat(saveBonus);
        $("#" + abilityName + "-save").html(StringFunctions.RemoveHtmlTags(bonusText));
    },

    FillInit: function () {
        let prof = $("input[name='init']:checked").val();
        let dexMod = MathFunctions.PointsToBonus($("#dex-input").val());
        let profBonus;
        if ($("#custom-cr-check").prop("checked")) {
            profBonus = $("#custom-prof-input").val();
        } else {
            profBonus = MathFunctions.GetProfBonus($("#cr-input").val());
        };
        let init = dexMod + prof * profBonus;
        let initText = StringFunctions.BonusFormat(init) + "（" + (10 + init) + "）";
        $("#init-value").val(StringFunctions.RemoveHtmlTags(initText));
    },

    FillAc: function () {
        let armorName = $("#armor-input").val(),
            natArmorBonus = Number($("#nat-armor-input").val()),
            shieldBonus = $("#shield-input").prop("checked") ? 2 : 0,
            dexScore = Number($("#dex-input").val());
        let ac = MathFunctions.GetAc(armorName, natArmorBonus, shieldBonus, dexScore);
        $("#ac-value").val(StringFunctions.RemoveHtmlTags(ac));

        if (armorName == "外皮") {
            $("#nat-armor-prompt").show();
        } else {
            $("#nat-armor-prompt").hide();
        };
    },

    FillHp: function () {
        let size, hitDie;
        if ($("#custom-size-check").prop('checked')) {
            size = $("#custom-size-input").val();
        } else {
            size = $("#size-input").val();
        };
        hitDie = MathFunctions.GetHitDie(size);
        
        let hdNum = Number($("#hitdice-input").val());
        let conMod = MathFunctions.PointsToBonus($("#con-input").val());
        let hp = Math.floor(hdNum * ((1 + hitDie) / 2 + conMod));
        let hpText = hp + "（" + hdNum + "d" + hitDie + "＋" + (hdNum * conMod) + "）";
        $("#hp-value").val(StringFunctions.RemoveHtmlTags(hpText));
        $("#hitdice-size").html("d" + hitDie);
    },

    FillSkillBonus: function (skillName) {
        let prof = $("input[name=" + skillName + "]:checked").val();
        if (prof == 0) {
            bonusText = "";
        } else {
            let skillData = ArrayFunctions.FindInList(data.skills, skillName);
            let score = $("#" + skillData.stat + "-input").val();
            let profBonus;
            if ($("#custom-cr-check").prop("checked")) {
                profBonus = $("#custom-prof-input").val();
            } else {
                profBonus = MathFunctions.GetProfBonus($("#cr-input").val());
            };
            let bonus = MathFunctions.PointsToBonus(score) + prof * profBonus;
            bonusText = StringFunctions.RemoveHtmlTags(StringFunctions.BonusFormat(bonus));
        }
        $("#" + skillName + "-bonus").html(bonusText);
    },
    
    // フォーム非表示、呼び出すのはSetFormsとHTMLからのみ
    ShowHideHtmlElement: function (element, show) {
        show ? $(element).show() : $(element).hide();
    },

    ShowHover: function () {
        let fly = $("#fly-ft-input").val();
        $("#hover-box-note").toggle(fly > 0);
    },

    ShowMagical: function () {
        let darkvision = $("#darkvision-ft-input").val();
        $("#magical-box-note").toggle(darkvision > 0);
    },

    ShowSeparatorInput: function () {
        $("#left-separator-button").toggle(mon.doubleColumns);
        $("#right-separator-button").toggle(mon.doubleColumns);
    },

    ShowLegendary: function () {
        let show = $("is-legendary-input").prop("checked");
        $("#add-legendary-action-form").toggle(show);
        $("#add-legendary-button").toggle(show);
        this.ShowMythic();
        this.ShowLair();
        this.ShowRegional();
    },

    ShowMythic: function () {
        let show = $("is-legendary-input").prop("checked") && $("is-mythic-input").prop("checked");
        $("#add-mythic-action-form").toggle(show);
        $("#add-mythic-button").toggle(show);
    },

    ShowLair: function () {
        let show = $("is-legendary-input").prop("checked") && $("has-lair-input").prop("checked");
        $("#add-lair-action-form").toggle(show);
        $("#add-lair-button").toggle(show);
    },

    ShowRegional: function () {
        let show = $("is-legendary-input").prop("checked") && $("has-regional-input").prop("checked");
        $("#add-regional-action-form").toggle(show);
        $("#add-regional-button").toggle(show);
    },

    ResetSkillInput: function () {
        for (let i = 0; i < data.skills.length; i++) {
            let skillName = data.skills[i].name;
            $("input[name=" + skillName + "]").val(0);
            this.FillSkillBonus(skillName, 0);
        }
    },

    ResetDamageTypesForm: function () {
        let damagetype;
        for (let i = 0; i < data.damagetypes.length; i++) {
            damagetype = data.damagetypes[i];
            $("input[name=" + damagetype + "]").val("");
        }
    },

    ResetConditionsForm: function () {
        for (let i = 0; i < data.conditions.length; i++) {
            let conditionName = data.conditions[i];
            $("input[id=" + conditionName + "-check]").prop("checked", false);
        }
    },

    // For setting the legendary action description
    SetLegendaryDescriptionForm: function () {
        $("#legendary-descsection-input").val(mon.legendariesDescription);
    },

    // For setting the mythic action description
    SetMythicDescriptionForm: function () {
        $("#mythic-descsection-input").val(mon.mythicDescription);
    },

    // For setting the lair action description
    SetLairDescriptionForm: function () {
        $("#lair-descsection-input").val(mon.lairDescription);
    },

    // For setting the regional effect end description
    SetLairDescriptionEndForm: function () {
        $("#lair-end-descsection-input").val(mon.lairDescriptionEnd);
    },

    // For setting the regional effect description
    SetRegionalDescriptionForm: function () {
        $("#regional-descsection-input").val(mon.regionalDescription);
    },

    // For setting the regional effect end description
    SetRegionalDescriptionEndForm: function () {
        $("#regional-end-descsection-input").val(mon.regionalDescriptionEnd);
    },

    SetCommonAbilitiesDropdown: function () {
        $("#common-trait-input").html("");
        for (let index = 0; index < data.commonAbilities.length; index++)
            $("#common-trait-input").append("<option value='" + index + "'>" + data.commonAbilities[index].name + "</option>");
    },

    // 能力値と修正を設定
    SetStatForm: function (abilityName, statPoints) {
        $("#" + abilityName + "-input").val(statPoints);
        $("#" + abilityName + "-bonus").html(StringFunctions.RemoveHtmlTags(StringFunctions.BonusFormat(MathFunctions.PointsToBonus(statPoints))));
    },

    // セーヴ習熟をチェック、修正値を入力
    SetSaveForm: function (abilityName, prof) {
        $("#" + abilityName + "-save-check").prop("checked", prof);
        this.FillSaveBonus(abilityName);
    },

    // 技能習熟を設定、修正値を入力
    SetSkillForm: function (skillName, prof) {
        $("input[name=" + skillName + "]").val(prof);
        this.FillSkillBonus(skillName);
    },

    // ダメージ種別を設定
    SetDamagetypeForm: function (damagetype, value) {
        $("input[name=" + damagetype + "][value=" + value + "]").prop("checked", true);
    },

    // 状態をチェック
    SetConditionForm: function (conditionName, check) {
        $("#" + conditionName + "-check").prop("checked", check);
    },

    // セーヴボーナスを入力
    SetSaveBonus: function (abilityName, prof) {
        if (!prof) return;
        let statPoint = mon[abilityName + "Points"];
        let profBonus = CrFunctions.GetProf();
        $("#" + abilityName + "-save").html(StringFunctions.RemoveHtmlTags(StringFunctions.BonusFormat(MathFunctions.PointsToBonus(statPoint) + profBonus)));
    },

    // 技能ボーナスを入力
    SetSkillBonus: function (skillName, prof) {
        if (prof == 0) return;
        let abilityName = ArrayFunctions.FindInList(data.allSkills, skillName).stat;
        let statPoint = mon[abilityName + "Points"];
        let profBonus = CrFunctions.GetProf();
        $("#" + skillName).html(StringFunctions.RemoveHtmlTags(StringFunctions.BonusFormat(MathFunctions.PointsToBonus(statPoint) + prof * profBonus)));
    },

    // Make a list of removable items and add it to the editor
    MakeDisplayList: function (arrName, capitalize, isBlock = false) {
        if (typeof mon[arrName] == 'undefined')
            mon[arrName] = [];
        let arr = (mon[arrName]),
            displayArr = [],
            content = "",
            arrElement = "#" + arrName + "-input-list";
        for (let i = 0; i < arr.length; i++) {
            let element = arr[i],
                elementName = element.name,
                note = element.hasOwnProperty("note") ? element.note : "";

            // 文字列の作成
            if (arrName == "languages") {
                content = "<b>" + StringFunctions.FormatString(elementName + note, false) + (element.speaks || element.speaks == undefined ? "" : "（理解）") + "</b>";
            }
            else
                content = "<b>" + StringFunctions.FormatString(elementName + note, false) + (element.hasOwnProperty("desc") ?
                    "：</b>" + StringFunctions.FormatString(element.desc, isBlock) : "</b>");

            // アイコン列の作成
            let functionArgs = arrName + "\", " + i + ", " + capitalize + ", " + isBlock,
                imageHTML = "<img class='statblock-image' src='./files/img/trash-icon.png' alt='削除' title='削除' onclick='FormFunctions.RemoveDisplayListItem(\"" + functionArgs + ")'>";
            if (arrName != "gears" && arrName != "languages")
                imageHTML += " <img class='statblock-image' src='./files/img/pen-icon.png' alt='編集' title='編集' onclick='FormFunctions.EditDisplayListItem(\"" + functionArgs + ")'>";
            imageHTML += " <img class='statblock-image' src='./files/img/up-icon.png' alt='1つ上へ' title='1つ上へ' onclick='FormFunctions.SwapDisplayListItem(\"" + arrName + "\", " + i + ", -1)'>" +
                " <img class='statblock-image' src='./files/img/down-icon.png' alt='1つ下へ' title='1つ下へ' onclick='FormFunctions.SwapDisplayListItem(\"" + arrName + "\", " + i + ", 1)'>";
            //displayArr.push("<li> " + imageHTML + " " + content + "</li>");
            displayArr.push(imageHTML + " " + content + "</br>");
        }
        $(arrElement).html(displayArr.join(""));

        //$(arrElement).parent()[arr.length == 0 ? "hide" : "show"]();
        $(arrElement).parent().toggle(arr.length != 0);
    },

    // Remove an item from a display list and update it
    RemoveDisplayListItem: function (arrName, index, capitalize, isBlock) {
        let arr;
        if (arrName == "damage") {
            if (mon.damagetypes.length - index > 0)
                arr = mon.damagetypes;
            else {
                index -= mon.damagetypes.length;
                arr = mon.specialdamage;
            }
        } else
            arr = mon[arrName];
        arr.splice(index, 1);
        this.MakeDisplayList(arrName, capitalize, isBlock);
    },

    // Bring an item into the abilities textbox for editing
    EditDisplayListItem: function (arrName, index, capitalize) {
        let item = mon[arrName][index];
        $("#traits-name-input").val(item.name);
        $("#traits-description-input").val(item.desc);
    },

    // Change position
    SwapDisplayListItem: function (arrName, index, swap) {
        arr = mon[arrName];
        if (index + swap < 0 || index + swap >= arr.length) return;
        let temp = arr[index + swap];
        arr[index + swap] = arr[index];
        arr[index] = temp;
        this.MakeDisplayList(arrName, false, true);
    },

    // Initialize Forms
    InitForms: function () {
        let dropdownBuffer = [
            "<option value=*>カスタムCR</option>",
            "<option value=0>0 (", data.crs["0"].xp, "XP）</option>",
            "<option value=1/8>1/8 (", data.crs["1/8"].xp, "XP）</option>",
            "<option value=1/4>1/4 (", data.crs["1/4"].xp, "XP）</option>",
            "<option value=1/2>1/2 (", data.crs["1/2"].xp, "XP）</option>"
        ];
        for (let cr = 1; cr <= 30; cr++)
            dropdownBuffer.push("<option value=", cr, ">", cr, "（", data.crs[cr].xp, "XP）</option>");
        $("#cr-input").html(dropdownBuffer.join(""));
    }
}

// インプット関数、HTML経由のみ呼び出し
var InputFunctions = {
    // プリセットから全変数を取得
    GetPreset: function () {
        let name = $("#monster-select").val();
        if (name == "") return;
        if (name == "default") {
            GetVariablesFunctions.SetPreset(data.defaultPreset);
            FormFunctions.SetForms();
            UpdateStatblock();
            return;
        }
        $.getJSON("./files/json/monsters.json/" + name, function (jsonArr) {
            GetVariablesFunctions.SetPreset(jsonArr);
            FormFunctions.SetForms();
            UpdateStatblock();
        })
        .fail(function () {
            console.error("プリセットの読み込みに失敗しました。");
            return;
        })
    },

    ChangeSize: function () {
        FormFunctions.FillHp();
    },

    ChangeCr: function () {
        let cr = $("#cr-input").val();
        for (i = 0; i < data.abilities.length; i++) {
            FormFunctions.FillSaveBonus(data.abilities[i]);
        };
        FormFunctions.FillInit;
        for (let i = 0; i < data.skills.length; i++) {
            FormFunctions.FillSkillBonus(data.skills[i].name);
        };
    },

    ChangeAbility: function (abilityName) {
        FormFunctions.FillMod(abilityName);
        FormFunctions.FillSaveBonus(abilityName);

        if (abilityName == "dex") {
            FormFunctions.FillInit();
            FormFunctions.FillAc();
        } else if (abilityName == "con") {
            FormFunctions.FillHp();
        };
        for (let i = 0; i < data.skills.length; i++) {
            let skillName = data.skills[i].name,
                ability = data.skills[i].stat;
            if (abilityName == ability) FormFunctions.FillSkillBonus(skillName);
        };
    },

    ChangeSave: function (abilityName) {
        FormFunctions.FillSaveBonus(abilityName);
    },

    ChangeInit: function () {
        FormFunctions.FillInit();
    },

    ChangeArmor: function () {
        FormFunctions.FillAc();
    },

    ChangeHitDice: function () {
        FormFunctions.FillHp();
    },

    // メートル入力時にフィートを自動計算
    ChangeDistance: function (id) {
        let distance = $("#" + id).val();
        let unit = (id.includes("ft")) ? "feet": "meter";
        let toId, toDistance;
        if (unit == "feet") { // メートル -> フィート
            toId = id.replace("-ft-","-m-");
            toDistance = MathFunctions.Feet2Meter(distance);
        } else { // フィート -> メートル
            toId = id.replace("-m-","-ft-");
            toDistance = MathFunctions.Meter2Feet(distance);
        };
        $("#" + toId).val(toDistance);

        //if (id.includes("fly")) FormFunctions.ShowHover(); // ホバリング表示
        //if (id.includes("darkvision")) FormFunctions.ShowMagical();
    },

    // リストにアイテムを追加

    AddGearsInput: function () { //保留
        // Insert alphabetically
        GetVariablesFunctions.AddGear($("#gears-input").val());

        // Display
        FormFunctions.MakeDisplayList("gears", true);
    },

    AddLanguageInput: function (speaks) {
        // 順番に挿入
        GetVariablesFunctions.AddLanguage($("#languages-input").val(), speaks);

        // 表示
        FormFunctions.MakeDisplayList("languages", false);
    },

    // 入力ドロップダウンに応じてCRを変更
    InputCR: function () {
        mon.cr = $("#cr-input").val();
        if ($("#custom-cr-check").prop("checked")) {
            mon.customCr = $("#custom-cr-input").val();
            mon.customProf = parseInt($("#custom-prof-input").val());
        }
        FormFunctions.ChangeCRForm();
    },

    AddTraitInput: function (arrName) {
        let traitName = $("#traits-name-input").val().trim(),
            traitDesc = $("#traits-description-input").val().trim();

        if (traitName.length == 0 || traitDesc.length == 0)
            return;

        // Insert at end, or replace ability if it exists already
        GetVariablesFunctions.AddTrait(arrName, traitName, traitDesc, true);

        // Display
        FormFunctions.MakeDisplayList(arrName, false, true);

        // Clear forms
        $("#traits-name-input").val("");
        $("#traits-description-input").val("");
    },

    // Reset legendary description to default
    LegendaryDescriptionDefaultInput: function () {
        GetVariablesFunctions.LegendaryDescriptionDefault();
        FormFunctions.SetLegendaryDescriptionForm();
    },

    // Reset mythic description to default
    MythicDescriptionDefaultInput: function () {
        GetVariablesFunctions.MythicDescriptionDefault();
        FormFunctions.SetMythicDescriptionForm();
    },

    // Reset lair description to default
    LairDescriptionDefaultInput: function () {
        GetVariablesFunctions.LairDescriptionDefault();
        FormFunctions.SetLairDescriptionForm();
        GetVariablesFunctions.LairDescriptionEndDefault();
        FormFunctions.SetLairDescriptionEndForm();
    },

    // Reset regional description to default
    RegionalDescriptionDefaultInput: function () {
        GetVariablesFunctions.RegionalDescriptionDefault();
        FormFunctions.SetRegionalDescriptionForm();
        GetVariablesFunctions.RegionalDescriptionEndDefault();
        FormFunctions.SetRegionalDescriptionEndForm();
    },

    AddCommonTraitInput: function () {
        let commonTrait = data.commonAbilities[$("#common-trait-input").val()];
        if (commonTrait.desc) {
            $("#traits-name-input").val(commonTrait.hasOwnProperty("realname") ? commonTrait.realname : commonTrait.name);
            $("#traits-description-input").val(commonTrait.desc);
            //$("#abilities-desc-input").val(StringFunctions.StringReplaceAll(commonTrait.desc, "[MON]", mon.name.toLowerCase()));
        }
    }
}

// 重要な変数を取得／設定する関数群
var GetVariablesFunctions = {
    // Get all Variables from forms
    // フォームからすべての変数を取得
    GetAllVariables: function () {
        // 名前
        mon.name = $("#name-input").val().trim();

        // サイズ
        mon.size = $("#size-input").val().trim();
        mon.swarm = $("#swarm-check").prop('checked') ?
            $("#swarm-input").val().trim() : "";
        mon.customSize = $("#custom-size-check").prop('checked') ?
            $("#custom-size-input").val().trim() : "";

        // クリーチャー分類
        mon.type = $("#type-input").val();
        mon.tag = $("#tag-input").val().trim();
        mon.customType = $("#custom-type-check").prop('checked') ?
            $("#custom-type-input").val() : "";

        // 属性
        mon.alignment = $("#alignment-input").val().trim();
        mon.customAlignment = $("#custom-alignment-check").prop('checked') ?
            $("#custom-alignment-input").val().trim() : "";

        // AC
        mon.armorName = $("#armor-input").val();
        mon.natArmorBonus = parseInt($("#nat-armor-input").val());
        mon.shieldBonus = $("#shield-input").prop("checked") ? 2 : 0;
        mon.customAc = $("#custom-ac-check").prop("checked") ?
            $("custom-ac-input").val() : "";
        console.log(mon.customAlignment)

        // イニシアチブ
        mon.init = $("input[name='init']:checked").val();
        mon.customInit = $("#custom-init-check").prop("checked") ?
            $("#custom-init-input").val() : "";

        // HP
        mon.hitDice = $("#hitdice-input").val();
        mon.customHp = $("#custom-hp-check").prop("checked") ?
            $("#custom-hp-input").val() : "";

        // 移動速度
        mon.walkSpeed = $("#walk-ft-input").val();
        mon.burrowSpeed = $("#burrow-ft-input").val();
        mon.swimSpeed = $("#swim-ft-input").val();
        mon.climbSpeed = $("#climb-ft-input").val();
        mon.flySpeed = $("#fly-ft-input").val();
        mon.hover = $("#hover-input").prop("checked");
        mon.customSpeed = $("#custom-speed-check").prop("checked") ?
            $("#custom-speed-input").val() : "";

        // 能力値
        mon.strScore = $("#str-input").val();
        mon.dexScore = $("#dex-input").val();
        mon.conScore = $("#con-input").val();
        mon.intScore = $("#int-input").val();
        mon.wisScore = $("#wis-input").val();
        mon.chaScore = $("#cha-input").val();

        // セーヴ
        for (let i = 0; i < data.abilities.length; i++) {
            let stat = data.abilities[i].name;
            mon.saves[i] = $("#" + stat + "-save-check").prop("checked");
        }

        // 技能
        for (let i = 0; i < data.skills.length; i++) {
            let skill = data.skills[i].name;
            mon.skills[i] = $("input[name=" + skill + "]:checked").val();
        }
        mon.customSkills = $("#custom-skills-check").val() ?
            $("#custom-skills-input").val() : "";

        // ダメージ種別
        for (let i = 0; i < data.damagetypes.length; i++) {
            let damagetype = data.damagetypes[i];
            mon.damagetypes[i] = $("input[name=" + damagetype + "]:checked").val();
        }
        let customDamagetype = $("#custom-damagetypes-check").val()
        mon.customVulnerable = customDamagetype ?
            $("#custom-vulnerable-input").val(): "";
        mon.customResistant = customDamagetype ?
            $("#custom-resistant-input").val(): "";
        mon.customImmune = customDamagetype ?
            $("#custom-immune-input").val(): "";

        // 状態
        for (let i = 0; i < data.conditions.length; i++) {
            let condition = data.conditions[i];
            mon.conditions[i] = $("#" + condition + "-check").prop("checked");
        }
        mon.customConditions = $("#custom-conditions-check").val() ?
            $("#custom-conditions-input").val() : "";

        // 装備
        mon.gearsText = $("#gears-text-input").val();

        // 感覚
        mon.darkvision = $("#darkvision-ft-input").val();
        mon.blindsight = $("#blindsight-ft-input").val();
        mon.tremorsense = $("#tremorsense-ft-input").val();
        mon.truesight = $("#truesight-ft-input").val();
        mon.magical = $("#magical-input").prop("checked");
        mon.customSenses = $("#custom-senses-check").val() ?
            $("#custom-senses-input").val() : "";

        // 言語
        mon.understandsBut = $("#understands-but-input").val();
        mon.telepathy = $("#telepathy-ft-input").val();

        // 脅威度
        mon.cr = $("#cr-input").val();
        mon.customCr = $("#custom-cr-check").val() ?
            $("#custom-cr-input").val() : "";
        mon.customProf = $("#custom-cr-check").val() ?
            parseInt($("#custom-prof-input").val()) : 0;

        // 略称
        mon.shortName = $("#short-name-input").val();
        mon.pluralName = $("#plural-name-input").val();

        // 伝説的
        mon.isLegendary = $("#is-legendary-input").prop("checked");
        if (mon.isLegendary)
            mon.legendariesDescription = $("#legendaries-descsection-input").val().trim();

        // 神話的
        mon.isMythic = $("#is-mythic-input").prop("checked");
        if (mon.isMythic)
            mon.mythicDescription = $("#mythic-descsection-input").val().trim();

        // 住処
        mon.isLair = $("#has-lair-input").prop("checked");
        if (mon.isLair) {
            mon.lairDescription = $("#lair-descsection-input").val().trim();
            mon.lairDescriptionEnd = $("#lair-end-descsection-input").val().trim();
        }

        // 環境に及ぼす影響
        mon.isRegional = $("#has-regional-input").prop("checked");
        if (mon.isRegional) {
            mon.regionalDescription = $("#regional-descsection-input").val().trim();
            mon.regionalDescriptionEnd = $("#regional-end-descsection-input").val().trim();
        }

        mon.properties;
        mon.traits;
        mon.actions;
        mon.bonusActions;
        mon.reactions;
        mon.legendaries;
        mon.mythics;
        mon.lairs;
        mon.regionals;
        mon.specialdamage;

        // 1列？2列？
        mon.doubleColumns = $("#2col-input").prop("checked");
        mon.separationPoint;

        // 距離単位
        mon.byFeet = $("#by-feet-input").prop("checked");
        mon.byMeter = $("#by-meter-input").prop("checked");
    },

    // プリセットから全変数を設定
    // custom系はリセットする？
    SetPreset: function (preset) {
        // 名前、サイズ、クリーチャー分類、属性
        mon.name = preset.name.trim();
        mon.size = preset.size.trim().toLowerCase();
        mon.swarm = preset.group;
        mon.customSize = "";
        mon.type = preset.type.trim();
        mon.tag = preset.subtype.trim();
        mon.customType = "";
        mon.alignment = preset.alignment.trim();
        mon.customAlignment = "";

        // CR 住処要検討
        mon.cr = preset.challenge_rating;
        mon.crLair = preset.challenge_rating_lair;
        mon.customCr = "";
        mon.customProf = null;
        let profBonus = MathFunctions.GetProfBonus(mon.cr);

        // 能力値
        mon.strScore = preset.strength;
        mon.dexScore = preset.dexterity;
        mon.conScore = preset.constitution;
        mon.intScore = preset.intelligence;
        mon.wisScore = preset.wisdom;
        mon.chaScore = preset.charisma;
        let strMod = MathFunctions.PointsToBonus(mon.strScore);
        let dexMod = MathFunctions.PointsToBonus(mon.dexScore);
        let conMod = MathFunctions.PointsToBonus(mon.conScore);
        let intMod = MathFunctions.PointsToBonus(mon.intScore);
        let wisMod = MathFunctions.PointsToBonus(mon.wisScore);
        let chaMod = MathFunctions.PointsToBonus(mon.chaScore);

        // セーヴ
        mon.saves[0] = (preset.strength_save > strMod);
        mon.saves[1] = (preset.dexterity_save_save > dexMod);
        mon.saves[2] = (preset.constitution_save_save > conMod);
        mon.saves[3] = (preset.intelligence_save > intMod);
        mon.saves[4] = (preset.wisdom_save > wisMod);
        mon.saves[5] = (preset.charisma_save > chaMod);

        // AC 防具を判断
        // とりあえずプリセットに特殊防具は考えない？
        mon.armorName = "";
        for (let i = 0; i < preset.actions.length - 1; i++) {
            if (preset.actions[i].desc.includes("メイジ・アーマー")) {
                mon.armorName = "メイジ・アーマー";
                break;
            }
        };
        mon.shieldBonus = 0;
        if (preset.gears != "") {
            if (preset.gears.includes("シールド")) {
                mon.shieldBonus = 2;
            };
            if (!mon.armorName) {
                for (let i = 0; i < data.armors.length - 1; i++) {
                    if (preset.gears.includes(data.armors[i].key)) {
                        mon.armorName = data.armors[i].key;
                        break;
                    };
                };
            };
        };
        if (!mon.armorName) {
            mon.armorName = "外皮";
            mon.natArmorBonus = preset.armor_class - 10 - dexMod;
            if (mon.natArmorBonus == 0) {
                mon.armorName = "なし";
            }
        };
        mon.customAc = "";

        mon.init = (preset.initiative - dexMod) / profBonus;
        mon.customInit = "";

        // Hit Dice
        mon.hitDice = parseInt(preset.hit_dice.split("d")[0]);
        mon.customHp = "";

        // Speeds
        let GetSpeed = (speedList, speedType) => speedList.hasOwnProperty(speedType) ? parseInt(speedList[speedType]) : 0;
        mon.walkSpeed = GetSpeed(preset.speed, "walk");
        mon.burrowSpeed = GetSpeed(preset.speed, "burrow");
        mon.climbSpeed = GetSpeed(preset.speed, "climb");
        mon.flySpeed = GetSpeed(preset.speed, "fly");
        mon.swimSpeed = GetSpeed(preset.speed, "swim");
        mon.hover = preset.speed.hasOwnProperty("hover");
        mon.customSpeed = "";

        //要検討
        if (preset.speed.hasOwnProperty("notes")) {
            mon.customSpeed = preset.speed.walk + "㌳（" + preset.speed.notes + "）";
        } else {
            mon.customSpeed = StringFunctions.GetSpeed();
        };

        // 技能
        for (let i = 0; i < data.skills.length; i++) {
            let skillName = data.skills[i].name;
            if (skillName in preset.skills) {
                let abilityMod = MathFunctions.PointsToBonus(mon[data.skills[i].ability + "Score"]);
                let profBonus = CrFunctions.GetProf();
                mon.skills[i] = (preset.skills[skillName].value - abilityMod) / profBonus;
            } else {
                mon.skills[i] = 0;
            };
        };
        mon.customSkills = "";

        // ダメージ種別
        for (let i = 0; i < data.damagetypes.length; i++) {
            let damagetype = data.damagetypes[i];
            if (preset.vulnerabilities.includes("［" + damagetype + "］")) {
                mon.damagetypes[i] = "v";
            } else if (preset.resistances.includes("［" + damagetype + "］")){
                mon.damagetypes[i] = "r";
            } else if (preset.immunities.includes("［" + damagetype + "］")){
                mon.damagetypes[i] = "i";
            } else {
                mon.damagetypes[i] = "n";
            };
        };
        mon.customVulnerable = "";
        mon.customResistant = "";
        mon.customImmune = "";

        // 状態
        for (let i = 0; i < data.conditions.length; i++) {
            let conditionName = data.conditions[i];
            if (preset.immunities.includes(conditionName + "状態")){
                mon.conditions[i] = true;
            } else {
                mon.conditions[i] = false;
            }
        };
        mon.customConditions = "";

        // 言語 要検討
        mon.languages = [];
        mon.telepathy = 0;
        mon.understandsBut = "";
        if (preset.languages.includes("を解する")) {
            let speaksUnderstandsArr = preset.languages.split("を解する"),
                speaks = speaksUnderstandsArr[0].length > 0 ? speaksUnderstandsArr[0].trim().split("、") : [],
                understands = speaksUnderstandsArr[1].split("が"),
                understandsLangs = understands[0].replace("および", "、").split("、"),
                understandsBut = understands.length > 1 ? understands[1].trim() : "";

            for (let i = 0; i < speaks.length; i++)
                this.AddLanguage(speaks[i], true);
            for (let i = 0; i < understandsLangs.length; i++)
                this.AddLanguage(understandsLangs[i], false);

            if (understandsBut.toLowerCase().includes("テレパシー")) {
                mon.telepathy = parseInt(understandsBut.replace(/\D/g, ""));
                understandsBut = understandsBut.substr(0, understandsBut.lastIndexOf("、"));
            }
            mon.understandsBut = understandsBut;
        } else {
            let languagesPresetArr = preset.languages.split("、");
            for (let i = 0; i < languagesPresetArr.length; i++) {
                let languageName = languagesPresetArr[i].trim();
                languageName.toLowerCase().includes("telepathy") ?
                    mon.telepathy = parseInt(languageName.replace(/\D/g, "")) :
                    this.AddLanguage(languageName, true);
            }
        };

        // 感覚 要検討
        mon.darkvision = 0;
        mon.blindsight = 0;
        mon.tremorsense = 0;
        mon.truesight = 0;
        mon.magical = false;
        let sensesPresetArr = [];
        if (preset.senses.includes("；")) { // 受動知覚は無視
            sensesPresetArr = preset.senses.split("；")[0].split("、");
        };
        for (let i = 0; i < sensesPresetArr.length; i++) {
            let senseString = sensesPresetArr[i].trim(),
                senseName = senseString.match(/\D+/)[0],
                senseDist = senseString.match(/\d+/)[0];
            switch (senseName) {
                case "暗視":
                    mon.darkvision = senseDist;
                    mon.magical = senseString.includes("魔法の暗闇");
                    break;
                case "疑似視覚":
                    mon.blindsight = senseDist;
                    break;
                case "振動感知":
                    mon.tremorsense = senseDist;
                    break;
                case "超視覚":
                    mon.truesight = senseDist;
                    break;
            }
        };
        mon.customSenses = "";

        // 置換用モンスター名
        mon.shortName = "";
        mon.pluralName = "";

        // Legendary?
        mon.isLegendary = Array.isArray(preset.legendary_actions);
        if (preset.legendary_desc == null || preset.legendary_desc.length == 0)
            this.LegendaryDescriptionDefault();
        else
            mon.legendariesDescription = preset.legendary_desc;
        FormFunctions.SetLegendaryDescriptionForm();

        // Mythic?
        mon.isMythic = Array.isArray(preset.mythic_actions);
        if (preset.mythicy_desc == null || preset.mythic_desc.length == 0)
            this.MythicDescriptionDefault();
        else
            mon.legendariesDescription = preset.mythic_desc;
        FormFunctions.SetMythicDescriptionForm();

        // Lair?
        mon.isLair = Array.isArray(preset.lair_actions);
        if (preset.lair_desc == null || preset.lair_desc.length == 0) {
            this.LairDescriptionDefault();
            this.LairDescriptionEndDefault();
        }
        else {
            mon.lairDescription = preset.lair_desc;
            mon.lairDescriptionEnd = preset.lair_desc_end;
        }
        FormFunctions.SetLairDescriptionForm();

        // Regional Effects?
        mon.isRegional = Array.isArray(preset.regional_actions);
        if (preset.regional_desc == null || preset.regional_desc.length == 0) {
            this.RegionalDescriptionDefault();
            this.RegionalDescriptionEndDefault();
        }
        else {
            mon.regionalDescription = preset.regional_desc;
            mon.regionalDescriptionEnd = preset.regional_desc_end;
        }
        FormFunctions.SetRegionalDescriptionForm();
        FormFunctions.SetRegionalDescriptionEndForm();

        // 特徴
        mon.traits = [];
        mon.actions = [];
        mon.bonusActions = [];
        mon.reactions = [];
        mon.legendaries = [];
        mon.mythics = []
        mon.lairs = [];
        mon.regionals = [];
        let traitsPresetArr = preset.traits,
            actionsPresetArr = preset.actions,
            bonusActionsPresetArr = preset.bonusActions,
            reactionsPresetArr = preset.reactions,
            legendariesPresetArr = preset.legendary_actions,
            mythicPresetArr = preset.mythic_actions,
            lairsPresetArr = preset.lair_actions,
            regionalsPresetArr = preset.regional_actions;

        let self = this,
            TraitPresetLoop = function (arr, name) {
                if (Array.isArray(arr)) {
                    for (let index = 0; index < arr.length; index++)
                        self.AddTraitPreset(name, arr[index]);
                }
            };

        TraitPresetLoop(traitsPresetArr, "traits");
        TraitPresetLoop(actionsPresetArr, "actions");
        TraitPresetLoop(bonusActionsPresetArr, "bonusActions");
        TraitPresetLoop(reactionsPresetArr, "reactions");
        if (mon.isLegendary)
            TraitPresetLoop(legendariesPresetArr, "legendaries");
        if (mon.isMythic)
            TraitPresetLoop(mythicPresetArr, "mythics");
        if (mon.isLair)
            TraitPresetLoop(lairsPresetArr, "lairs");
        if (mon.isRegional)
            TraitPresetLoop(regionalsPresetArr, "regionals");

        mon.separationPoint = undefined; // This will make the separation point be automatically calculated in UpdateStatblock
    },

    // 配列に追加

    AddGear: function (gearName) { // とりあえず残し
        if (gearName == "") return;
        if (gearName == "*") {
            gearName = $("#other-gear-input").val().trim();
            if (gearName.length == 0) return;
        }
        ArrayFunctions.ArrayInsert(mon.gears, {
            "name": gearName
        }, false);
    },

    AddLanguage: function (languageName, speaks) {
        if (languageName == "") return;
        if (languageName == "*") {
            languageName = $("#other-language-input").val().trim();
            if (languageName.length == 0) return;
        }
        if (mon.languages.length > 0) {
            if (languageName == "あらゆる言語" || mon.languages[0].name == "あらゆる言語")
                mon.languages = [];
        }
        ArrayFunctions.ArrayInsert(mon.languages, {
            "name": languageName.trim(),
            "speaks": speaks
        }, false);
    },

    // Add abilities, actions, bonus actions, reactions, legendary actions, etc

    AddTrait: function (arrName, traitName, traitDesc) {
        let arr = mon[arrName];
        ArrayFunctions.ArrayInsert(arr, {
            "name": traitName.trim(),
            "desc": traitDesc.trim()
        }, false);
    },

    //要検討
    AddTraitPreset: function (arrName, trait) {
        let traitName = trait.name.trim(),
            traitDesc = trait.desc;
        if (Array.isArray(traitDesc))
            traitDesc = traitDesc.join("\n");
        traitDesc = traitDesc.trim();

        // In case of spellcasting ボーナスアクション要検討
        if (arrName == "actions" && traitName.includes("spellcasting") && traitDesc.includes("\n")) {
            traitDesc = traitDesc.split("\u2022").join(""), // Remove bullet points
                spellcastingAbility =
                traitDesc.includes("知力") ? "INT" :
                    traitDesc.includes("判断力") ? "WIS" :
                        traitDesc.toLowerCase().includes("魅力") ? "CHA" : null;

            if (spellcastingAbility != null) {
                traitDesc = traitDesc
                    .replace(/難易度\d+/g.exec(traitDesc), "難易度[" + spellcastingAbility + " SAVE]")
                    .replace(/攻撃ボーナス[＋|－]\d+/g.exec(traitDesc), "攻撃ボーナス[" + spellcastingAbility + " ATK]");
            };

            // For hag covens
            let postDesc = "";
            if (traitName.toLowerCase().includes("shared spellcasting")) {
                let lastLineBreak = traitDesc.lastIndexOf("\n\n");
                postDesc = traitDesc.substr(lastLineBreak).trim();
                traitDesc = traitDesc.substring(0, lastLineBreak);
            };

            let firstLineBreak = traitDesc.indexOf("\n");
            spellcastingDesc = traitDesc.substr(0, firstLineBreak).trim();
            spellcastingSpells = traitDesc.substr(firstLineBreak).trim();

            // 呪文リスト（空白以降）
            spellsArr = spellcastingSpells.split("\n");
            for (let i = 0; i < spellsArr.length; i++) {
                let string = spellsArr[i],
                    splitString = string.split("：");
                if (splitString.length < 2) continue;
                //呪文リストを斜体に、各呪文内の（）は斜体じゃない
                let newString = splitString[1];
                newString = StringFunctions.StringReplaceAll(newString, "（", "_（");
                newString = StringFunctions.StringReplaceAll(newString, "）", "）_");
                spellsArr[i] = " " + splitString[0].trim() + "：_" + newString.trim() + "_";
            }

            spellcastingSpells = spellsArr.join("\n>");

            traitDesc = spellcastingDesc + "\n\n\n>" + spellcastingSpells;

            // For hag covens
            if (postDesc.length > 0)
                traitDesc += "\n\n" + postDesc;
        }

        // In case of attacks
        if (arrName == "actions" && traitDesc.toLowerCase().includes("attack")) {
            // Italicize the correct parts of attack-type actions
            let lowercaseDesc = traitDesc.toLowerCase();
            for (let index = 0; index < data.attackTypes.length; index++) {
                let attackType = data.attackTypes[index];
                if (lowercaseDesc.includes(attackType)) {
                    let indexOfStart = lowercaseDesc.indexOf(attackType),
                        indexOfHit = lowercaseDesc.indexOf("hit:");
                    if (indexOfStart != 0) break;
                    traitDesc = "_" + traitDesc.slice(0, attackType.length) + "_" + traitDesc.slice(attackType.length, indexOfHit) + "_" + traitDesc.slice(indexOfHit, indexOfHit + 4) + "_" + traitDesc.slice(indexOfHit + 4);
                    break;
                }
            }
        }

        if (traitName.length != 0 && traitDesc.length != 0)
            this.AddTrait(arrName, traitName, traitDesc);
    },

    // Return the default legendary description
    LegendaryDescriptionDefault: function () {
        mon.legendaryDescription = "この[MON]は3回の伝説的アクションを行なえる（そのたび以下の選択肢の中から任意のものを使用できる）。伝説的アクションを行なえるのは他のターンの終了時に限られる。また、1度に使用できる伝説的アクションは1つだけである。この[MON]は、自分のターンの開始時ごとに、消費済みの伝説的アクションの使用回数を回復する。";
    },

    // Return the default mythic description
    MythicDescriptionDefault: function () {
        mon.mythicDescription = "この[MON]が追い詰められ、“？？？”を起動したなら、以下のオプションも伝説的アクションとして使用できるようになる。";
    },

    // Return the default lair description
    LairDescriptionDefault: function () {
        mon.lairDescription = "イニシアチブ20の時点で（同値の場合は常に後）、この[MON]は住処アクションを行ない、以下のうち任意の1つの効果を生み出せる。同一の効果を2ラウンド連続で使用することはできない。";
    },

    // Return the default lair end description
    LairDescriptionEndDefault: function () {
        mon.lairDescriptionEnd = "The " + mon.name + " can't repeat an effect until they have all been used, and it can't use the same effect two rounds in a row.";
    },

    // Return the default regional description
    RegionalDescriptionDefault: function () {
        mon.regionalDescription = "伝説的な" + mon.name + "の住処のある場所は、この[MON]の魔力によってひきゆがみ、以下のうち1つ以上の効果を受ける。";
    },

    // Return the default regional end description
    RegionalDescriptionEndDefault: function () {
        mon.regionalDescriptionEnd = "この[MON]が死んだなら、これらの効果は1d10日で消え去る。";
    }
}

// 文字列を返す関数群
var StringFunctions = {
    // ボーナスが正の時は＋、負の時は－を付加
    BonusFormat: (bonus) => bonus >= 0 ? "＋" + bonus : "－" + bonus * (-1),

    GetCrText: function (cr) {
        let xp = data.crs[mon.cr].xp;
        let profBonus = data.crs[mon.cr].prof;
        return cr + "（" + xp + "XP；習熟ボーナス＋" + profBonus + "）";
    },

    GetDistance: function (feet) {
        if (mon.byMeter && !mon.byFeet)
            return MathFunctions.Feet2Meter(feet) + "m";
        if (!mon.byMeter && mon.byFeet)
            return feet + "㌳";
        return feet + "㌳（" + MathFunctions.Feet2Meter(feet) + "m）";
    },

    // 変数から文字列を作成

    // モンスターのヘッダ（サイズ、分類、属性）を取得
    GetCreatureHeading: function () {
        let type, alignment, sizeType;
        type = (mon.customType ? mon.customType : mon.type + (mon.tag ? "（" + mon.tag + "）" : ""));
        alignment = (mon.customAlignment ? mon.customAlignment : mon.alignment);
        if (mon.customSize) {
            sizeType = mon.customSize.replace(/\[TYPE\]/, type);
        } else if (mon.swarm) {
            sizeType = mon.swarm + "の" + type + "からなる" + mon.size + "の大群";
        } else {
            sizeType = this.RemoveHtmlTags(mon.size) + "・" + type;
        };
        return sizeType + "、" + alignment;
    },

    // イニシアチブ表示用の文字列を取得
    GetInit: function () {
        if (mon.customInit != "") return mon.customInit;
        let dexBonus = MathFunctions.PointsToBonus(mon.dexScore),
            profBonus = mon.customProf ? mon.customProf: CrFunctions.GetProf(mon.cr);
            initBonus = dexBonus + mon.init * profBonus;
        return this.BonusFormat(initBonus) + "（" + (10 + initBonus) + "）";
    },

    // HP表示用の文字列を取得
    GetHp: function () {
        if (mon.customHp) return mon.customHp;
        let conBonus = MathFunctions.PointsToBonus(mon.conScore),
            hitDieSize = data.sizes[mon.size].hitDie,
            avgHP = Math.floor(mon.hitDice * ((hitDieSize + 1) / 2) + conBonus);
        if (conBonus > 0)
            return avgHP + "（" + mon.hitDice + "d" + hitDieSize + "＋" + (mon.hitDice * conBonus) + "）";
        if (conBonus == 0)
            return avgHP + "（" + mon.hitDice + "d" + hitDieSize + "）";
        return Math.max(avgHP, 1) + "（" + mon.hitDice + "d" + hitDieSize + "－" + -(mon.hitDice * conBonus) + "）";
    },

    // 移動速度表示用の文字列を取得
    GetSpeed: function () {
        if (mon.customSpeed != "") return mon.customSpeed;
        let speedsDisplayArr = [this.GetDistance(mon.walkSpeed)];
        if (mon.burrowSpeed > 0) speedsDisplayArr.push("穴掘" + this.GetDistance(mon.burrowSpeed));
        if (mon.swimSpeed > 0) speedsDisplayArr.push("水泳" + this.GetDistance(mon.swimSpeed));
        if (mon.climbSpeed > 0) speedsDisplayArr.push("登攀" + this.GetDistance(mon.climbSpeed));
        if (mon.flySpeed > 0) speedsDisplayArr.push("飛行" + this.GetDistance(mon.flySpeed) + (mon.hover ? "（ホバリング）" : ""));
        return speedsDisplayArr.join("、")
    },

    // 感覚表示用の文字列を取得
    GetSenses: function () {
        if (mon.customSenses != "") return mon.customSenses;
        let sensesDisplayArr = [];
        if (mon.darkvision > 0) sensesDisplayArr.push("暗視" + StringFunctions.GetDistance(mon.darkvision) + (mon.magical ? "（魔法の暗闇に妨げられない）" : ""));
        if (mon.blindsight > 0) sensesDisplayArr.push("擬似視覚" + StringFunctions.GetDistance(mon.blindsight));
        if (mon.tremorsense > 0) sensesDisplayArr.push("振動感知" + StringFunctions.GetDistance(mon.tremorsense));
        if (mon.truesight > 0) sensesDisplayArr.push("超視覚" + StringFunctions.GetDistance(mon.truesight));
        let sensesDisplayString = sensesDisplayArr.join("、")

        // 受動知覚
        let pp = 10 + MathFunctions.PointsToBonus(mon.wisScore) + mon.skills[12] * CrFunctions.GetProf();
        let ppText = "受動〈知覚〉" + pp
        
        return this.ConcatUnlessEmpty(sensesDisplayString, ppText, "；");
    },

    GetCr: function () {
        if (mon.customCr) return mon.customCr.replace("[PROF]", mon.customProf);
        return this.GetCrText(mon.cr);
    },

    // プロパティ表示用の文字列を取得
    GetPropertiesDisplayArr: function () {
        // Properties
        let propertiesDisplayArr = [],
            skillsDisplayString = "",
            vulnerableDisplayString = "",
            resistantDisplayString = "",
            immuneDisplayString = "",
            conditionsDisplayString = "",
            gearsDisplayString = "",
            sensesDisplayString = "",
            languageDisplayString = "",
            understandsDisplayString = "";
        
        // 技能
        let skillsDisplayArr = [];
        let profBonus = mon.customCr ?
            mon.customProf : MathFunctions.GetProfBonus(mon.cr);
        for (let i = 0; i < data.skills.length; i++) {
            let skill = data.skills[i];
            let skillProf = mon.skills[i];
            if (skillProf > 0) {
                let abilityMod = MathFunctions.PointsToBonus(mon[skill.stat + "Score"]),
                    bonus = abilityMod + skillProf * profBonus;
                skillsDisplayArr.push("〈" + skill.name + "〉" + this.BonusFormat(bonus));
            };
        };
        skillsDisplayString = skillsDisplayArr.join("、");

        // ダメージ種別
        let vulnerableDisplayArr = [],
            resistantDisplayArr = [],
            immuneDisplayArr = [];
        if (mon.customDamage != "") { //手動入力
            vulnerableDisplayArr[0] = mon.customVulnerable;
            resistantDisplayArr[0] = mon.customResistant;
            immuneDisplayArr[0] = mon.customImmune;
        } else {
            for (let i = 0; i < data.damagetypes.length; i++) {
                let damagetype = data.damagetypes[i];
                let has = mon.damagetypes[i];
                if (has == "v") {
                    vulnerableDisplayArr.push("［" + damagetype + "］");
                } else if (has == "r") {
                    resistantDisplayArr.push("［" + damagetype + "］");
                } else if (has == "i") {
                    immuneDisplayArr.push("［" + damagetype + "］");
                };
            };
        };
        vulnerableDisplayString = vulnerableDisplayArr.join("、");
        resistantDisplayString = resistantDisplayArr.join("、");
        immuneDisplayString = immuneDisplayArr.join("、");

        // 状態
        let conditionsDisplayArr = [];
        for (let i = 0; i < data.conditions.length; i++) {
            let condition = data.conditions[i];
            if (mon.conditions[i])
                conditionsDisplayArr.push(condition + "状態");
        };
        conditionsDisplayString = conditionsDisplayArr.join("、");
        immuneDisplayString = StringFunctions.ConcatUnlessEmpty(immuneDisplayString, conditionsDisplayString, "；");
        
        // 感覚
        sensesDisplayString = this.GetSenses();

        // 装備 選択式にするかもしれないからとりあえず残す
        /*for (let i = 0; i < mon.gears.length; i++)
            gearsDisplayArr.push(gears[i]);
        */
        gearsDisplayString = mon.gearsText;

        // 言語
        if (mon.customLanguage) {
            languageDisplayString = mon.customLanguage;
        } else {
            let speaksLanguages = [], understandsLanguages = [];
            for (let i = 0; i < mon.languages.length; i++) {
                let language = mon.languages[i];
                if (language.speaks || language.speaks == undefined)
                    speaksLanguages.push(language.name);
                else
                    understandsLanguages.push(language.name);
            };
            for (let i = 0; i < speaksLanguages.length; i++)
            languageDisplayString = speaksLanguages.join("、");

            // 理解が1つ以上
            if (understandsLanguages.length > 0) {
                if (understandsLanguages.length > 1) {
                    if (understandsLanguages.length > 2) { // 理解が3つ以上
                        understandsDisplayString = understandsLanguages.join("、") + "を解する";
                    }
                    else // 理解が2つ
                        understandsDisplayString = understandsLanguages.join("と") + "を解する";
                } else // 理解が1つ
                    understandsDisplayString = understandsLanguages[0] + "を解する";
                if (mon.understandsBut && mon.understandsBut.trim().length > 0)
                    understandsDisplayString += "が" + mon.understandsBut.trim();
            };
            languageDisplayString = StringFunctions.ConcatUnlessEmpty(languageDisplayString, understandsDisplayString, "；");
        };

        // テレパシー 言語のあいうえお順に入れるかも？
        let telepathyDisplayString;
        if (mon.telepathy > 0)
            telepathyDisplayString = "テレパシー" + StringFunctions.GetDistance(mon.telepathy);
        languageDisplayString = StringFunctions.ConcatUnlessEmpty(languageDisplayString, telepathyDisplayString, "；");
        if (!languageDisplayString) languageDisplayString = "なし";

        // すべてを配列に結合する関数
        let pushArr = (name, string) => {
            if (string) propertiesDisplayArr.push({
                "name": name,
                "string": string
            })
        };

        pushArr("技能：", skillsDisplayString);
        pushArr("脆弱性：", vulnerableDisplayString);
        pushArr("抵抗：", resistantDisplayString);
        pushArr("完全耐性：", immuneDisplayString);
        pushArr("装備：", gearsDisplayString);
        pushArr("感覚：", sensesDisplayString);
        pushArr("言語：", languageDisplayString);

        return propertiesDisplayArr;
    },

    // 斜体、インデント、改行を追加
    FormatString: function (string, isBlock) {
        if (typeof string != "string")
            return string;

        // Complicated regex stuff to add indents
        if (isBlock) {
            let execArr, newlineArr = [],
                regExp = new RegExp("(\r\n|\r|\n)+", "g");
            while ((execArr = regExp.exec(string)) !== null)
                newlineArr.push(execArr);
            let index = newlineArr.length - 1;
            while (index >= 0) {
                let newlineString = newlineArr[index],
                    reverseIndent = (string[newlineString.index + newlineString[0].length] == ">");

                string = this.StringSplice(string, newlineString.index, newlineString[0].length + (reverseIndent ? 1 : 0),
                    "</div>" + (newlineString[0].length > 1 ? "<br>" : "") + (reverseIndent ? "<div class='reverse-indent'>" : "<div class='indent'>"));

                index--;
            }
        }

        // 斜体、インデント
        string = this.FormatStringHelper(string, "_", "<i>", "</i>")
        string = this.FormatStringHelper(string, "**", "<b>", "</b>")
        return string;
    },

    // FormatString helper function
    FormatStringHelper: function (string, target, startTag, endTag) {
        while (string.includes(target)) {
            let startIndex = string.indexOf(target);
            string = this.StringSplice(string, startIndex, target.length, startTag);
            let endIndex = string.indexOf(target, startIndex + target.length);
            if (endIndex < 0)
                return string + endTag;
            string = this.StringSplice(string, endIndex, target.length, endTag);
        }
        return string;
    },

    // HTML文字列 [名前：表示文字列]の配列を受け取ってdivブロックを返す
    MakePropertyHTML: function (property, firstLine) {
        if (!property.string) return "";
        let htmlClass = firstLine ? "property-line first" : "property-line";
        return "<div class=\"" + htmlClass + "\"><div><h4>" + StringFunctions.RemoveHtmlTags(property.name)
            + "</h4> <p>" + StringFunctions.RemoveHtmlTags(this.FormatString(property.string, false))
            + "</p></div></div> <!-- property line -->"
    },

    MakeTraitHTML: function (name, description) {
        return "<div class=\"property-block\"><div><h4>" + StringFunctions.RemoveHtmlTags(name) + "：</h4> <p> " + this.FormatString(StringFunctions.RemoveHtmlTags(description), true) + "</p></div></div> <!-- property block -->";
    },

    // 伝説的アクションの各項のHTMLを作る
    MakeTraitHTMLLegendary: function (name, description) {
        return "<div class=\"property-block reverse-indent legendary\"><div><h4>" + StringFunctions.RemoveHtmlTags(name) + "：</h4> <p> " + this.FormatString(StringFunctions.RemoveHtmlTags(description), true) + "</p></div></div> <!-- property block -->";
    },

    MakeTraitHTMLLairRegional: function (name, description) {
        if (name) {
            return "<div class=\"property-block reverse-indent legendary\"><div><h4>" + StringFunctions.RemoveHtmlTags(name) + "：</h4> <p>" + this.FormatString(StringFunctions.RemoveHtmlTags(description), true) + "</p></div></div> <!-- property block -->";
        }
        return "<div class=\"property-block lairregional\"><div><li>" + this.FormatString(StringFunctions.RemoveHtmlTags(description), true) + "</li></div></div> <!-- property block -->";
    },

    // General string operations

    // 両方空じゃなければ指定した文字列で結合
    ConcatUnlessEmpty(item1, item2, joinString = "；") {
        if (item1 && item2) return item1 + joinString + item2;
        if (item1 && !item2) return item1;
        if (!item1 && item2) return item2;
        if (!item1 && !item2) return "";
    },

    StringSplice: (string, index, remove, insert = "") => string.slice(0, index) + insert + string.slice(index + remove),

    StringReplaceAll: (string, find, replacement) => string.split(find).join(replacement),

    StringCapitalize: (string) => string[0].toUpperCase() + string.substr(1),

    GetNumbersOnly: (string) => parseInt(string.replace(/\D/g, '')),

    RemoveHtmlTags(string) {
        if (typeof (string) != "string")
            return string;
        return StringFunctions.StringReplaceAll(string, '<', "&lt;")
    },
}

// 計算関数群
var MathFunctions = {
    // 最小値〜最大値の間の数に丸める
    Clamp: (num, min, max) => Math.min(Math.max(num, min), max),

    // 能力値に応じて修正値を計算
    PointsToBonus: (points) => Math.floor(points / 2) - 5,

    GetSaveBonus: function (pts, saveProf, profBonus) {
        return this.MathFunctions.PointsToBonus(pts) + saveProf ? profBonus : 0;
    },

    // アーマー・クラスを算出
    GetAc: function (armorName, natArmorBonus, shieldBonus, dex) {
        let armor = data.armors[armorName],
            dexBonus = MathFunctions.PointsToBonus(dex);
        if (armor) {
            if (armor.type == "軽装") return armor.ac + dexBonus + shieldBonus;
            if (armor.type == "中装") return armor.ac + Math.min(dexBonus, 2) + shieldBonus;
            if (armor.type == "重装") return armor.ac + shieldBonus;
            if (armorName == "外皮") return 10 + dexBonus + natArmorBonus + shieldBonus;
            if (armorName == "メイジ・アーマー") return 13 + dexBonus + shieldBonus;
        }
        return 10 + dexBonus + shieldBonus;
    },

    GetHitDie: function (size) {
        if (size in data.sizes) return data.sizes[size].hitDie;
        // リストに一致しない場合、一番大きいヒットダイスを返す
        for (let i = data.sizes.length - 1; i == 0; i--) {
            if (size.includes(data.sizes[i].key)) return data.sizes[size].hitDie;
        };
        return 8; // それもなければ適当にd8
    },

    GetProfBonus: function (cr) {
        return data.crs[cr].prof;
    },
    
    // フィートをメートルに変換する
    Feet2Meter: (feet) => feet / 10 * 3,
    
    // メートルをフィートに変換する
    Meter2Feet: (meter) => meter / 3 * 10
}

// These don't really fit anywhere else
var CrFunctions = {
    GetProf: function () {
        if (mon.customCr) return mon.customProf;
        return data.crs[mon.cr].prof;
    },

    GetString: function () {
        if (mon.customCr) return mon.customCr.trim();
        return mon.cr + "（" + data.crs[mon.cr].xp + "XP；習熟ボーナス＋" + this.GetProf() + "）";
    }
}

// 配列関数
var ArrayFunctions = {
    // アルファベット順に挿入 使う？
    ArrayInsert: function (arr, element, alphabetSort) {
        let lowercaseElement = element.name.toLowerCase();
        for (let i = 0; i < arr.length; i++) {
            let lowercaseIndex = arr[i].name.toLowerCase();
            if (alphabetSort && lowercaseIndex > lowercaseElement) {
                arr.splice(i, 0, element)
                return;
            }
            if (lowercaseIndex == lowercaseElement) {
                arr.splice(i, 1, element)
                return;
            }
        }
        arr.push(element);
    },

    // 配列内を検索してインデックスを返す
    FindInList: function (arr, name) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].name == name) return arr[i];
        }
        return null;
    },

    // Take a string representing an array from a preset and turn it into a normal array
    FixPresetArray: function (string) {
        let arr = string.split(","),
            returnArr = [];
        for (let index = 0; index < arr.length; index++) {
            let name = arr[index].trim();
            if (name.length > 0)
                returnArr.push(name);
        }
        return returnArr;
    }
};

/*
// Document ready function DOM構築時に読込、らしい
$(function () {
    // プリセット用モンスター名の読込
    $.getJSON("./files/json/monsters.json", function (monsters) {
        let monsterSelect = $("#monster-select");
        monsterSelect.append("<option value=''></option>");
        monsterSelect.append("<option value=''>-5e SRD-</option>");
        $.each(monsters, function (index, value) {
            monsterSelect.append("<option value='" + value.slug + "'>" + value.name + "</option>");
        });
    })
    .fail(function () {
        $("#monster-select-form").html("モンスターのプリセットを読み込めません。")
    });

    // jsonデータの読込
    $.getJSON("./files/json/statblockdata.json", function (json) {
        data = json;

        // 保存データがなかった場合にプリセットを設定
        GetVariablesFunctions.SetPreset(data.defaultPreset);

        // 保存データを読込
        SavedData.RetrieveFromLocalStorage();

        Populate();
    });

    console.log(data);
    GetVariablesFunctions.GetAllVariables();

    FormFunctions.DisableCustomSize();
    FormFunctions.DisableCustomType();
    FormFunctions.DisableCustomAlignment();
    FormFunctions.DisableCustomArmor();
    FormFunctions.DisableCustomInitiative();
    FormFunctions.DisableCustomHp();
    FormFunctions.ShowHideHoverBox();
    FormFunctions.DisableCustomSpeed();
    FormFunctions.ShowHideMagicalBox();

    FormFunctions.ShowHideFormatHelper();
});
*/

$(function () {
    init();
});

async function init() {
    try {
        // プリセット用モンスター名の読込
        let monsters = await $.getJSON("./files/json/monsters.json");
        let monsterSelect = $("#monster-select");
        monsterSelect.append("<option value=''></option>");
        monsterSelect.append("<option value=''>-5e SRD-</option>");
        $.each(monsters, function (index, monster) {
            monsterSelect.append("<option value='" + monster.slug + "'>" + monster.name + "</option>");
        });
    } catch (err) {
        $("#monster-select-form").html("モンスターのプリセットを読み込めません。");
    };
    try {
        // jsonデータの読込
        data = await $.getJSON("./files/json/statblockdata.json");
        
        // デフォルトのモンスターデータを取得
        GetVariablesFunctions.SetPreset(data.defaultPreset);

        // Load saved data なんかうまくいかん
        //SavedData.RetrieveFromLocalStorage();
        
        InitializeEvents();
        Populate();
    } catch (err) {
        console.log("フォームの初期化に失敗しました。");
    };
};

// フォーム入力に応じてHTMLイベントを起動（onchangeの代替）
function InitializeEvents() {
    // サイズ
    $(document).on("change", "[data-size]", function () {
        InputFunctions.ChangeSize();
    });

    // 脅威度、習熟ボーナス
    $(document).on("change", "[data-cr]", function () {
        InputFunctions.ChangeCr();
    });

    // 能力値
    $(document).on("change", "[data-ability]", function () {
        let abilityName = $(this).attr("id").split("-")[0];
        InputFunctions.ChangeAbility(abilityName);
    });

    $(document).on("change", "[data-save]", function () {
        let abilityName = $(this).attr("id").split("-")[0];
        InputFunctions.ChangeSave(abilityName);
    });

    // 防具
    $(document).on("change", "[data-armor]", function () {
        InputFunctions.ChangeArmor();
    });

    // ヒットダイス数
    $(document).on("change", "[data-hitdice]", function () {
        InputFunctions.ChangeHitDice();
    });

    // イニシアチブ
    $(document).on("change", "[data-init]", function () {
        InputFunctions.ChangeInit();
    });

    // 技能
    $(document).on("change", "[data-skill]", function () {
        const skillName = $(this).attr("name");
        FormFunctions.FillSkillBonus(skillName);
    });

    // 言語
    $(document).on("change", "[data-language]", function () {
        $("#other-language-input").toggle($(this).val() == "*");
    });

    // 距離
    $(document).on("change", "[data-distance]", function () {
        const id = $(this).attr("id");
        InputFunctions.ChangeDistance(id);
    });

    // 表示・非表示の切替
    $(document).on("change", "[data-show]", function () {
        const id = $(this).attr("id");
        let toId;
        if (id.includes("-checkbox")) {
            toId = id.replace("-checkbox", "");
        } else {
            toId = $(this).attr("id").replace("-check", "-input");
        };
        $("#" + toId).toggle($(this).prop("checked"));
    });

    // 有効化／無効化の切替
    $(document).on("change", "[data-custom]", function () {
        const id = $(this).attr("id");
        const toId = id.replace("-check", "-input");
        const enable = $(this).prop('checked');
        if (id == "custom-damagetypes-check") {
            $("#custom-vulnerable-input").prop('disabled', !enable);
            $("#custom-resistant-input").prop('disabled', !enable);
            $("#custom-immune-input").prop('disabled', !enable);
        } else {
            $("#" + toId).prop('disabled', !enable);
        };
        if (id == "custom-cr-check") $("#custom-prof-input").prop('disabled', !enable);
    });

    // 伝説的
    $(document).on("change", "[data-legendary]", function () {
        const key = $(this).attr("id").split("-")[1];
        const show = $(this).prop("checked");
        $("#" + key + "-actions-form").toggle(show);
        $("#add-" + key + "-button").toggle(show);
        if (key === "legendary") {
            $("legendary-actions-form").toggle(show);
            $("mythic-actions-form").toggle(show);
            $("lair-actions-form").toggle(show);
            $("regional-actions-form").toggle(show);
            $("add-legendary-button").toggle(show);
            $("add-mythic-button").toggle(show);
            $("add-lair-button").toggle(show);
            $("add-regional-button").toggle(show);
        } else {
            $(key + "-actions-form").toggle(show);
            $("add-" + key + "-button").toggle(show);
        };
    });

    // リセット
    /*
    $(document).on("change", "[data-button]", function () {
        const id = $(this).attr("id");
        FormFunctions.Reset(name, value);
    }); */

    // リセット
    $(document).on("change", "[data-separator]", function () {
        FormFunctions.ShowSeparatorInput();
    });
};

// データをHTML上に配置する
function Populate() {

    FormFunctions.SetLegendaryDescriptionForm();
    FormFunctions.SetMythicDescriptionForm();
    FormFunctions.SetLairDescriptionForm();
    FormFunctions.SetLairDescriptionEndForm();
    FormFunctions.SetRegionalDescriptionForm();
    FormFunctions.SetRegionalDescriptionEndForm();
    FormFunctions.SetCommonAbilitiesDropdown();

    // Populate the stat block
    // FormFunctions.InitForms(); //なんでCRだけ初期化？
    FormFunctions.SetForms();
    UpdateStatblock();
};