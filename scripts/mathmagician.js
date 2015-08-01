// version 0.5

$('#savegame').keyup(import_save);
$('#souls').keyup(optimize);
$('body').on('change', '#laxsolo', optimize);
$('body').on('change', '#clicking', optimize);
$('body').on('change', '#ignoreIris', optimize);
$('body').on('change', '#noBossLanding', optimize);
$('body').on('change', '#primalsouls', primalSouls);

var data;
var hasMorgulis = false;
var laxSolomon = false;
var clicking = false;
var ignoreIris = false;
var primalsouls = false;
var irisBonus = 0;
var useArgaiv = false;

if(!Math.log10)	{
	Math.log10 = function(t){return(Math.log(t)/Math.LN10);};
}

Number.prototype.numberFormat = function(decimals, dec_point, thousands_sep) {
    dec_point = typeof dec_point !== 'undefined' ? dec_point : '.';
    thousands_sep = typeof thousands_sep !== 'undefined' ? thousands_sep : ',';

    var parts = this.toFixed(decimals).toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_sep);

    return parts.join(dec_point);
};

var anc = {};
anc[0] = {
	'Name':'Soul bank',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(0);},
	'desiredLevel':function(s){return(hasMorgulis ? 0 : s < 100 ? Math.ceil(1.1*Math.pow(s+1,2)) : Math.ceil(1.1*Math.pow(s,2) + 43.67*s + 33.58));}
}
anc[3] = {
	'Name':'Solomon',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(Math.round(Math.pow(lvl, 1.5)));},
	'desiredLevel':function(s){return(Math.ceil(1.15*Math.pow(laxSolomon ? Math.log10(3.25*Math.pow(s,2)) : Math.log(3.25*Math.pow(s,2)),0.4)*Math.pow(s,0.8)));}
};
anc[4] = {
	'Name':'Libertas',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.ceil(0.917*s));}
};
anc[5] = {
	'Name':'Siyalatas',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(useArgaiv ? 0 : Math.ceil(s+1));}
};
anc[8] = {
	'Name':'Mammon',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.ceil(0.921*s));}
};
anc[9] = {
	'Name':'Mimzee',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.ceil(0.925*s));}
};
anc[10] = {
	'Name':'Pluto',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':true,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.ceil(0.5*s));}
};
anc[11] = {
	'Name':'Dogcog',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':25,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(this.maxLevel);}
};
anc[12] = {
	'Name':'Fortuna',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':40,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(this.maxLevel);}
};
anc[13] = {
	'Name':'Atman',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':25,
	'upgradeCost':function(lvl){return(Math.round(Math.pow(lvl, 1.5)));},
	'desiredLevel':function(s){return(this.maxLevel);}
};
anc[14] = {
	'Name':'Dora',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':50,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(this.maxLevel);}
};
anc[15] = {
	'Name':'Bhaal',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':true,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.ceil(0.5*s));}
};
anc[16] = {
	'Name':'Morgulis',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(1);},
	'desiredLevel':function(s){return(hasMorgulis ? Math.ceil(Math.pow(s,2) + 43.67*s + 33.58) : 0);}
};
anc[18] = {
	'Name':'Bubos',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':25,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(this.maxLevel);}
};
anc[19] = {
	'Name':'Fragsworth',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':true,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.ceil(0.5*s));}
};
anc[21] = {
	'Name':'Kumawakamaru',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':5,
	'upgradeCost':function(lvl){return(10*lvl);},
	'desiredLevel':function(s){return(this.maxLevel);}
};
anc[28] = {
	'Name':'Argaiv',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.ceil(s+9));}
};
anc[29] = {
	'Name':'Juggernaut',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':true,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(Math.round(Math.pow(lvl, 1.5)));},
	'desiredLevel':function(s){return(Math.ceil(0.1*s));}
};
anc[30] = {
	'Name':'Iris',
	'levelOld':0,
	'levelNew':0,
	'totalCost':0,
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(Math.round(Math.pow(lvl, 1.5)));},
	'desiredLevel':function(s){var t=Math.ceil((371*Math.log(s)-2080)/5)*5-1-irisBonus;return(t<(104-irisBonus)?0:t);}
};

function primalSouls(optimize)	{
	if(data.primalSouls)	{
		var bank = parseInt($('#old0').val());
		bank = $('#primalsouls').is(':checked') ? bank + data.primalSouls : bank - data.primalSouls;
		$('#old0').prop('value', bank);
	}
	optimize();
}

function getOptimal(ancient, level)	{
	var optimalLevel = ancient.desiredLevel(level);
	return(optimalLevel > 0 ? optimalLevel : 0);
}

function setCookie(cname, cvalue) {
	document.cookie = cname + "=" + cvalue.toString();
}

function savePreference(pname)	{
	setCookie(pname, $('#'+pname).is(':checked'));
}

function saveSettings()	{
	savePreference("noBossLanding");
	savePreference("laxsolo");
	savePreference("clicking");
	savePreference("ignoreIris");
}

function getCookie(cname)	{
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name) == 0)	{
			return c.substring(name.length,c.length);
		}
	}
	return "";
}

function getPreference(pname)	{
	$('#'+pname).prop('checked', getCookie(pname)=="true");
}

function loadSettings()	{
	getPreference("noBossLanding");
	getPreference("laxsolo");
	getPreference("clicking");
	getPreference("ignoreIris");
}

function optimize()	{

	var Siya = anc[5];
	var Argaiv = anc[28];
	var Bank = anc[0];
	clicking = 	$('#clicking').is(':checked');
	laxSolomon = $('#laxsolo').is(':checked');
	ignoreIris = $('#ignoreIris').is(':checked');
	irisBonus = parseInt($('#irisBonus').val());
	if($('#noBossLanding').is(':checked'))	{
		irisBonus++;
	}

	// reset cost and get the user input values to work with
	for(key in anc)	{
		var ancient = anc[key];

		ancient.totalCost = 0;
		ancient.levelOld = parseInt($('#old'+key).val());
		ancient.levelNew = ancient.levelOld;
	}

	if(Siya.levelOld === 0)	{
		useArgaiv = true;
	}
	else	{
		useArgaiv = false;
	}
	hasMorgulis = anc[16].levelOld > 0;

	var upgradeNext;
	while(upgradeNext != 0)	{
		// optimize loop ends when the best investment is the HS bank
		upgradeNext = 0;
		var highestIncrease = 0;
		var nextCost = 0;
		var nextBestIncrease = 0;

		for(key in anc)	{
			var ancient = anc[key];
			if(ancient.levelOld > 0 && (clicking == true || ancient.clicking == false) && (ignoreIris == false || key != 30))	{
				// do not process clicking ancients when clicking checkbox is off
				var upgradeCost = ancient.upgradeCost(ancient.levelNew+1);

				if(upgradeCost <= Bank.levelNew)	{
					var increase = useArgaiv ? (100*(ancient.desiredLevel(Argaiv.levelNew-9)-ancient.levelNew)) / ancient.levelNew : (100*(ancient.desiredLevel(Siya.levelNew)-ancient.levelNew)) / ancient.levelNew;

					if(increase >= highestIncrease)	{
						upgradeNext = key;
						nextBestIncrease = highestIncrease;
						highestIncrease = increase;
						nextCost = upgradeCost;
					}
				}
			}
		}

		if(upgradeNext != 0)	{
			var ancient = anc[upgradeNext];
			if(upgradeNext == 16)	{
				// Morg batch upgrade!
				var morgPlus = Math.ceil(((highestIncrease - nextBestIncrease)*ancient.levelNew)/100);
				if(morgPlus >= Bank.levelNew)	{
					morgPlus = Bank.levelNew;
					upgradeNext = 0;
				}
				ancient.totalCost += morgPlus;
				ancient.levelNew += morgPlus;
				Bank.levelNew -= morgPlus;
			}
			else	{
				ancient.totalCost += nextCost;
				ancient.levelNew++;
				Bank.levelNew -= nextCost;
			}
		}
	}

	// update HTML
	for(key in anc)	{
		var ancient = anc[key];

		$('#new'+key).prop('value', ancient.levelNew);
		$('#optimal'+key).prop('value', getOptimal(ancient, useArgaiv ? Argaiv.levelNew-10 : Siya.levelNew-1)); // subtract one, correcting because optimal siya is always Siya+1

		if(ancient.levelNew != ancient.levelOld)	{
			$('#delta'+key).prop('value', ancient.levelNew - ancient.levelOld);
		}
		else	{
			$('#delta'+key).prop('value', '');
		}
	}

	console.log('optimize finished');
	saveSettings();
}

const ANTI_CHEAT_CODE = "Fe12NAfA3R6z4k0z";
const SALT = "af0ik392jrmt0nsfdghy0";
function import_save() {
	var txt = $('#savegame').val();

	if (txt.search(ANTI_CHEAT_CODE) != -1) {
		var result = txt.split(ANTI_CHEAT_CODE);
		txt = "";
		for (var i = 0; i < result[0].length; i += 2) {
			txt += result[0][i];
		}
		if (CryptoJS.MD5(txt + SALT) != result[1]) {
			// alert("This is not a valid Clicker Heroes savegame!");
			return;
		}

		data = $.parseJSON(atob(txt));

		for(key in anc)	{
			var ancient = anc[key];

			if(key == 0)	{
				if(data.heroSouls > 0)	{
					$('#primalsouls').prop('checked', false);
					ancient.levelOld = data.heroSouls;
				}
				else	{
					$('#primalsouls').prop('checked', true);
					ancient.levelOld = data.primalSouls;
				}
			}
			else	{
				if(data.ancients.ancients.hasOwnProperty(key))	{
					ancient.levelOld = data.ancients.ancients[key].level;
					if(ancient.maxLevel !== 0)	{
						// hide capped ancients that are already maxed
						if(ancient.levelOld === ancient.maxLevel)	{
							$('#max'+key).prop('hidden',true);
						}
						else	{
							$('#max'+key).prop('hidden',false);
						}
					}
				}
			}
			$('#old'+key).prop('value', ancient.levelOld);
		}
		$('#primalsouls').prop('disabled', false);
		
		$('#relicfound').prop('textContent', data.items.gotAscensionItem ? "Yes" : "No");
		
		// find the Iris bonus from relics!
		irisBonus = 0;
		for(relic in data.items.items)	{
			for(var bonus=1; bonus <= 4; bonus++)	{
				var bonusType = data.items.items[relic]['bonusType'+bonus.toString()];
				if(bonusType === 6)	{
					var bonusLevel = data.items.items[relic]['bonus'+bonus.toString()+'Level'];
					console.log(data.items.items[relic].name + ' gives irisBonus ' + bonusLevel);
					irisBonus += bonusLevel;
				}
			}
		}
		$('#irisBonus').prop('value', irisBonus);

		var soulsSpent = 0
		for(key in data.ancients.ancients)	{
			soulsSpent += data.ancients.ancients[key].spentHeroSouls;
		}
		$('#soulsspent').prop('textContent', soulsSpent.numberFormat());		
		$('#hze').prop('textContent', data.highestFinishedZonePersist.numberFormat());		
		$('#worldresets').prop('textContent', data.numWorldResets.numberFormat());		

		optimize();

		if(anc[5].levelOld === 0)	{
			// active build that doesn't have Siya
			useArgaiv = true;
			clicking = true;
			$('#clicking').prop('checked', true);
		}
	}
}
