// version 13

$('#savegame').keyup(import_save);
$('body').on('change', '#laxsolo', optimize);
$('body').on('change', '#clicking', optimize);
$('body').on('change', '#ignoreIris', optimize);
$('body').on('change', '#noBossLanding', optimize);
$('body').on('change', '#primalsouls', primalSouls);

var data;
var hasMorgulis = false;
var laxSolomon = false;
var irisBonus = 0;
var irisMax = 0;

if(!Math.log10)	{
	Math.log10 = function(t){return(Math.log(t)/Math.LN10);};
}

function plural(n, s)	{
	var suffix = (s === undefined ? "s" : s);
	return(n == 1 ? "" : suffix)
}

Number.prototype.numberFormat = function(decimals, dec_point, thousands_sep) {
    dec_point = typeof dec_point !== 'undefined' ? dec_point : '.';
    thousands_sep = typeof thousands_sep !== 'undefined' ? thousands_sep : ',';

    var parts = this.toFixed(decimals).toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_sep);

    return parts.join(dec_point);
};

function calcMorgulis(s)	{
	var offs = [0,0.09,0.28,0.57,0.96,1.45,2.04,2.73,3.52,4.41,5.40];
	var tier = Math.min(Math.floor(s/10), 10);
	var percent = (25-tier)/100;
	var correction = offs[tier];

	var b = (1+percent+correction)/percent;
	var c = (0.11*(correction+1)-percent)/(0.11*percent);
	
	return(Math.pow(s,2) + b*s + c);
}

var anc = {};
anc[0] = {
	'Name':'Soul bank',
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(0);},
	'desiredLevel':function(s){return(hasMorgulis ? 0 : Math.round(1.1*calcMorgulis(s)));}
}
anc[3] = {
	'Name':'Solomon',
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(Math.round(Math.pow(lvl, 1.5)));},
	'desiredLevel':function(s){return(Math.round(1.15*Math.pow(laxSolomon ? Math.log10(3.25*Math.pow(s,2)) : Math.log(3.25*Math.pow(s,2)),0.4)*Math.pow(s,0.8)));}
};
anc[4] = {
	'Name':'Libertas',
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.round(0.93*s));}
};
anc[5] = {
	'Name':'Siyalatas',
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.round(s+1));}
};
anc[8] = {
	'Name':'Mammon',
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.round(0.93*s));}
};
anc[9] = {
	'Name':'Mimzee',
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.round(0.93*s));}
};
anc[10] = {
	'Name':'Pluto',
	'clicking':true,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.round(0.5*s));}
};
anc[11] = {
	'Name':'Dogcog',
	'clicking':false,
	'maxLevel':25,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(this.maxLevel);}
};
anc[12] = {
	'Name':'Fortuna',
	'clicking':false,
	'maxLevel':40,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(this.maxLevel);}
};
anc[13] = {
	'Name':'Atman',
	'clicking':false,
	'maxLevel':25,
	'upgradeCost':function(lvl){return(Math.round(Math.pow(lvl, 1.5)));},
	'desiredLevel':function(s){return(this.maxLevel);}
};
anc[14] = {
	'Name':'Dora',
	'clicking':false,
	'maxLevel':50,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(this.maxLevel);}
};
anc[15] = {
	'Name':'Bhaal',
	'clicking':true,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.round(0.5*s));}
};
anc[16] = {
	'Name':'Morgulis',
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(1);},
	'desiredLevel':function(s){return(hasMorgulis ? Math.round(calcMorgulis(s)) : 0);}
};
anc[18] = {
	'Name':'Bubos',
	'clicking':false,
	'maxLevel':25,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(this.maxLevel);}
};
anc[19] = {
	'Name':'Fragsworth',
	'clicking':true,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.round(0.5*s));}
};
anc[21] = {
	'Name':'Kumawakamaru',
	'clicking':false,
	'maxLevel':5,
	'upgradeCost':function(lvl){return(10*lvl);},
	'desiredLevel':function(s){return(this.maxLevel);}
};
anc[28] = {
	'Name':'Argaiv',
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.round(s+10));}
};
anc[29] = {
	'Name':'Juggernaut',
	'clicking':true,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(Math.round(Math.pow(lvl, 1.5)));},
	'desiredLevel':function(s){return(Math.round(0.1*s));}
};
anc[30] = {
	'Name':'Iris',
	'clicking':false,
	'maxLevel':0,
	'upgradeCost':function(lvl){return(Math.round(Math.pow(lvl, 1.5)));},
	'desiredLevel':function(s){var t=(irisMax == 0 ? Math.floor((371*Math.log(s)-2080)/5)*5-1-irisBonus : irisMax);return(t<(104-irisBonus)?0:t);}
};

function primalSouls()	{
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
	var Bank = anc[0];
	var Siya = anc[5];
	var Argaiv = anc[28];
	var Iris = anc[30];
	
	var clicking = 	$('#clicking').is(':checked');
	var ignoreIris = $('#ignoreIris').is(':checked');
	laxSolomon = $('#laxsolo').is(':checked');
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

	hasMorgulis = anc[16].levelOld > 0;

	var upgradeNext, referenceLevel;
	while(upgradeNext != 0)	{
		// optimize loop ends when the best investment is the HS bank
		upgradeNext = 0;
		var highestIncrease = 0;
		var nextCost = 0;
		var nextBestIncrease = 0;
		referenceLevel = Math.max(Argaiv.levelNew-9, Siya.levelNew, 1);
		var desiredBank = Bank.desiredLevel(referenceLevel);

		for(key in anc)	{
			var ancient = anc[key];
			var optimal = ancient.desiredLevel(referenceLevel);
			if(ancient.levelNew > 0 && (clicking == true || ancient.clicking == false) && (ignoreIris == false || key != 30))	{
				// Do not process ancients the user doesn't have.
				// Do not process clicking ancients when clicking checkbox is off.
				// Do not process Iris if disabled.
				var upgradeCost = ancient.upgradeCost(ancient.levelNew+1);

				if(upgradeCost <= (Bank.levelNew-desiredBank))	{	// always keep the desired soulbank, do not spend below this
				
					// determine the ancient that is lagging behind the most (biggest relative increase from current to optimal)
					var increase = (optimal-ancient.levelNew) / ancient.levelNew

					if(increase > highestIncrease)	{
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
				var morgPlus = Math.ceil((highestIncrease - nextBestIncrease)*ancient.levelNew);
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
	
	// correct for Iris not landing on the desired zone
	if(Iris.levelNew > Iris.levelOld && Iris.levelNew != Iris.desiredLevel(referenceLevel))	{
		irisMax = Math.floor((Iris.levelNew)/5)*5-1-irisBonus;
		optimize();
		return;
	}
	else	{
		irisMax = 0;
	}

	// update HTML
	for(key in anc)	{
		var ancient = anc[key];

		$('#new'+key).text(ancient.levelNew);
		$('#optimal'+key).text(getOptimal(ancient, (key == 5 || key == 28) ? referenceLevel-1 : referenceLevel));

		if(ancient.levelNew != ancient.levelOld)	{
			$('#delta'+key).text(ancient.levelNew - ancient.levelOld);
			if(key != 0)	{
				$('#delta'+key).attr("onmouseover", "nhpup.popup('"+ancient.Name+" upgrade cost:<br>"+ancient.totalCost.numberFormat()+" soul"+plural(ancient.totalCost)+"');");
			}
		}
		else	{
			$('#delta'+key).text('');
			$('#delta'+key).attr("onmouseover", "");
		}
	}
	
	saveSettings();
}

const ANTI_CHEAT_CODE = "Fe12NAfA3R6z4k0z";
const SALT = "af0ik392jrmt0nsfdghy0";
function import_save(evt) {

	if(evt && evt.keyCode == 17)	{
		// releasing Ctrl after Ctrl-V would trigger the import_save function twice, and also run optimize twice.
		// Ignore the Ctrl key release.
		return;
	}

	var txt = $('#savegame').val();

	if(txt.search(ANTI_CHEAT_CODE) != -1) {
		var result = txt.split(ANTI_CHEAT_CODE);
		txt = "";
		for (var i = 0; i < result[0].length; i += 2) {
			txt += result[0][i];
		}
		if (CryptoJS.MD5(txt + SALT) != result[1]) {
			$('#savegame').prop('class', 'error');
			return;
		}
		else	{
			$('#savegame').prop('class', '');
		}

		data = $.parseJSON(atob(txt));

		var totalSoulsSpent = 0
		for(key in anc)	{
			var ancient = anc[key];

			if(key == 0)	{
				$('#primalsouls').prop('checked', data.heroSouls == 0);
				ancient.levelOld = (data.heroSouls == 0 ? data.primalSouls : data.heroSouls);
			}
			else	{
				if(data.ancients.ancients.hasOwnProperty(key))	{
					ancient.levelOld = data.ancients.ancients[key].level;
					totalSoulsSpent += data.ancients.ancients[key].spentHeroSouls;
				}
				else	{
					ancient.levelOld = 0;
				}
				// hide capped ancients that are already maxed but show them if they're not
				$('#anc'+key).css('display', (ancient.maxLevel != 0 && ancient.levelOld == ancient.maxLevel) ? 'none' : 'table-row');
			}
			$('#old'+key).prop('value', ancient.levelOld);
		}
		$('#primalsouls').attr('disabled', false);

		$('#relicfound').prop('textContent', data.items.gotAscensionItem ? "Yes" : "No");

		// find the Iris bonus from relics!
		irisBonus = 0;
		for(relic in data.items.items)	{
			for(var bonus=1; bonus <= 4; bonus++)	{
				var bonusType = data.items.items[relic]['bonusType'+bonus.toString()];
				if(bonusType == 6)	{
					var bonusLevel = data.items.items[relic]['bonus'+bonus.toString()+'Level'];
					irisBonus += bonusLevel;
				}
			}
		}

		$('#irisBonus').prop('value', irisBonus);
		$('#soulsspent').text(totalSoulsSpent.numberFormat());
		$('#hze').text(data.highestFinishedZonePersist.numberFormat());
		$('#worldresets').text(data.numWorldResets.numberFormat());

		if(anc[5].levelOld == 0)	{
			// active build that doesn't have Siya
			$('#clicking').prop('checked', true);
		}

		optimize();
	}
	else	{
		$('#savegame').prop('class', txt=='' ? '' : 'error');
	}
}

function init()	{
	loadSettings();
	for(key in anc)	{
		var ancient = anc[key];
		ancient['levelOld'] = 0;
		ancient['levelNew'] = 0;
		if(ancient.maxLevel != 0)	{
			$('#anc'+key).css('display', 'none');
		}
	}
}
