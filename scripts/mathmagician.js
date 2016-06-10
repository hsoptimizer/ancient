// version 40

$('#savegame').keyup(import_save);
$('body').on('change', '#laxsolo', optimize);
$('body').on('change', '#ignoreIris', optimize);
$('body').on('change', '#noBossLanding', optimize);
$('body').on('change', '#primalsouls', primalSouls);
$('body').on('change', '#theme', setTheme);

var playstyle;
var data;
var hasMorgulis = false;
var laxSolomon = false;
var irisBonus = 0;
var irisMax = 0;
var millisecondsPerDay = 24*60*60*1000;
var millisecondsPerHour = 60*60*1000;
var totalGilds = 0;

$('input[type=radio][name=playstyle]').on('change', function(){ playstyle = $(this).val(); optimize(); });

if(!Math.log10)	{
	Math.log10 = function(t){return(Math.log(t)/Math.LN10);};
}

function setTheme()	{
	var selectedTheme = $( "#theme option:selected" ).val();
	saveSetting('theme', selectedTheme);
	document.getElementById('cssId').setAttribute('href',selectedTheme+'.css');
}

function toggle_options()	{
	var hideOptions = $('#showoptions').text() == 'Hide options';
	$('#options').toggle();
	$('#showoptions').text(hideOptions ? 'Show options' : 'Hide options');
	saveSetting('hideOptions', hideOptions);
}

function plural(n, s)	{
	var suffix = (s === undefined ? "s" : s);
	return(n == 1 ? "" : suffix)
}

function getBonusZone()	{
	if (data.numWorldResets == 0) {
		return(0);
	}
	else {
		var itemBonusZone;
		var minItemZone = anc[30].levelOld+irisBonus;
		var maxItemZone = Math.ceil(data.highestFinishedZonePersist * 0.66);
		if (maxItemZone - minItemZone <= Math.ceil(maxItemZone * 0.3))	{
			maxItemZone = minItemZone + Math.ceil(maxItemZone * 0.3);
		}
		minItemZone = Math.max(99,minItemZone);
		var seed = data.items.bonusZoneRoller.seed;
		do	{
			seed = (seed * 16807) % 2147483647;
			itemBonusZone = (seed % ((Math.max(101, maxItemZone) + 1) - minItemZone)) + minItemZone;
		}
		while(itemBonusZone % 5 == 0);
		return(itemBonusZone);
	}
}

function getRelicLevel(zone)	{
	return Math.max(Math.ceil(50 * (1 - Math.pow(1.2, (-1*zone/100 + 1)))),1);
}

Number.prototype.numberFormat = function(decimals, dec_point, thousands_sep) {
    dec_point = typeof dec_point !== 'undefined' ? dec_point : '.';
    thousands_sep = typeof thousands_sep !== 'undefined' ? thousands_sep : ',';

    var parts = this.toFixed(decimals).toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_sep);

    return parts.join(dec_point);
};

Number.prototype.padZero = function(length)	{
	var s = this.toString();
	return('0'.repeat(length - s.length) + s);
}

String.prototype.contains = function(expression)	{
	if(typeof expression == "string")	{
		return(this.indexOf(expression) != -1);
	}
	else if(typeof expression.test == "function")	{
		return(expression.test(this));
	}
	return(undefined);
};

String.prototype.repeat = function(count) {
    if (count < 1) return '';
    var result = '', pattern = this.valueOf();
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result + pattern;
};

function calcMorgulis(s)	{
	if(playstyle!='active')	{
		// based off Siya
		var tier = Math.min(Math.floor(s/10), 10);
		var percent = 25-tier;
		var correction = tier*(5*tier+4);
		var b = (100+percent+correction)/percent;
		var c = (correction+100)/percent - 100/11;
		return(s*(s+b)+c);
	}
	else	{
		// based off Fragsworth
		return(Math.pow(s,2) + 26*s + 15.91 + (50*(s+1))/(totalGilds > 0 ? totalGilds : 1));
	}
}

function idleBonus(s)	{
	var tier = Math.min(Math.floor(s/10), 10);
	return((25 - tier)*s + tier*(5*tier+4));
}

function solomonBonus(s)	{
	var tier = Math.min(Math.floor((s-1)/20), 4);
	return((5 - tier)*s + (10*tier*(tier+1)));
}

var anc = {};
anc[0] = {
	'Name':'Soul bank',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(10*lvl);},
	'bonusDesc':'% DPS (additive)',
	'upgradeCost':function(lvl){return(0);},
	'desiredLevel':function(s){return(hasMorgulis ? 0 : calcMorgulis(s)-(10/11));}
}
anc[3] = {
	'Name':'Solomon',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(solomonBonus(lvl));},
	'bonusDesc':'% Primal Hero Souls',
	'upgradeCost':function(lvl){return(Math.round(Math.pow(lvl, 1.5)));},
	// follows the general formula: a*(lg^0.4*(baseAncientLevel^0.8))
	// Idle  : a=1.15, b=3.25, baseAncient=Siya
	// Hybrid: a=1.32, b=4.65, baseAncient=Argaiv(28)
	// Active: a=1.21, b=3.73, baseAncient=Fragsworth
	// lg = log10(b*baseAncientLevel^2) (if laxSolomon) or ln(b*baseAncientLevel^2) (normal)
	'desiredLevel':function(s){
		var baseAncientLevel=(playstyle=='hybrid'?anc[28].levelNew:s);
		var a=(playstyle=='idle' ? 1.15 : playstyle=='hybrid' ? 1.32 : 1.21);
		var b=(playstyle=='idle' ? 3.25 : playstyle=='hybrid' ? 4.65 : 3.73);
		var lg=(laxSolomon ? Math.log10(b*Math.pow(baseAncientLevel,2)) : Math.log(b*Math.pow(baseAncientLevel,2)));
		return(Math.min(baseAncientLevel, a*(Math.pow(lg,0.4) * Math.pow(baseAncientLevel, 0.8))));
	}
};
anc[4] = {
	'Name':'Libertas',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(idleBonus(lvl));},
	'bonusDesc':'% Gold when Idle',
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(playstyle=='active' ? 0 : 0.927*s);}
};
anc[5] = {
	'Name':'Siyalatas',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(idleBonus(lvl));},
	'bonusDesc':'% DPS when Idle',
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(playstyle=='active' ? 0 : s+1);}
};
anc[8] = {
	'Name':'Mammon',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(5*lvl);},
	'bonusDesc':'% Gold Dropped',
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(0.927*s);}
};
anc[9] = {
	'Name':'Mimzee',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(50*lvl);},
	'bonusDesc':'% Treasure Chest Gold',
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(0.927*s);}
};
anc[10] = {
	'Name':'Pluto',
	'clicking':true,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(30*lvl);},
	'bonusDesc':'% Golden Clicks Gold',
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(playstyle=='idle' ? 0 : playstyle=='active' ? 0.927*s : 0.5*s);}
};
anc[11] = {
	'Name':'Dogcog',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':25,
	'getBonus':function(lvl){return(this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(-2*lvl);},
	'bonusDesc':'% Hero Upgrade Cost',
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.min(this.maxLevel, s));}
};
anc[12] = {
	'Name':'Fortuna',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':40,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat(2) + this.bonusDesc);},
	'bonusLevel':function(lvl){return(0.25*lvl);},
	'bonusDesc':'% 10x Gold Chance',
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.min(this.maxLevel, (s*this.maxLevel)/58));}
};
anc[13] = {
	'Name':'Atman',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':25,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(lvl);},
	'bonusDesc':'% Primal Bosses',
	'upgradeCost':function(lvl){return(Math.round(Math.pow(lvl, 1.5)));},
	'desiredLevel':function(s){return(Math.min(this.maxLevel, s));}
};
anc[14] = {
	'Name':'Dora',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':50,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(20*lvl);},
	'bonusDesc':'% Treasure Chests',
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.min(this.maxLevel, (s*this.maxLevel)/72));}
};
anc[15] = {
	'Name':'Bhaal',
	'clicking':true,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(15*lvl);},
	'bonusDesc':'% Critical Damage',
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(playstyle=='idle' ? 0 : playstyle=='active' ? Math.max(s*0.91,s-90) : 0.5*s);}
};
anc[16] = {
	'Name':'Morgulis',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(11*lvl);},
	'bonusDesc':'% DPS (additive)',
	'upgradeCost':function(lvl){return(1);},
	'desiredLevel':function(s){return(calcMorgulis(s));}
};
anc[18] = {
	'Name':'Bubos',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':25,
	'getBonus':function(lvl){return(this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(-2*lvl);},
	'bonusDesc':'% Boss Life',
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(Math.min(this.maxLevel, (s*this.maxLevel)/60));}
};
anc[19] = {
	'Name':'Fragsworth',
	'clicking':true,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(20*lvl);},
	'bonusDesc':'% Click Damage',
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(playstyle=='idle' ? 0 : playstyle=='active' ? s+1 : 0.5*s);}
};
anc[21] = {
	'Name':'Kumawakamaru',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':5,
	'getBonus':function(lvl){return(this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(-1*lvl);},
	'bonusDesc':' Monsters per Zone',
	'upgradeCost':function(lvl){return(10*lvl);},
	'desiredLevel':function(s){return(Math.min(this.maxLevel, s/3));}
};
anc[28] = {
	'Name':'Argaiv',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(2*lvl);},
	'bonusDesc':'% DPS per Gild',
	'upgradeCost':function(lvl){return(lvl);},
	'desiredLevel':function(s){return(playstyle=='active' ? s : Math.sqrt(calcMorgulis(s))-13);}
};
anc[29] = {
	'Name':'Juggernaut',
	'clicking':true,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat(2) + this.bonusDesc);},
	'bonusLevel':function(lvl){return(0.01*lvl);},
	'bonusDesc':'% Click Damage/DPS<br>(each Combo)',
	'upgradeCost':function(lvl){return(Math.round(Math.pow(lvl, 1.5)));},
	// based off Fragsworth (Siya/2) for Hybrid
	'desiredLevel':function(s){return(playstyle=='idle' ? 0 : playstyle=='active' ? Math.pow(s,0.8) : Math.pow(0.5*s, 0.8));}
};
anc[30] = {
	'Name':'Iris',
	'clicking':false,
	'levelOld':0,
	'levelNew':0,
	'maxLevel':0,
	'getBonus':function(lvl){return("+" + this.bonusLevel(lvl).numberFormat() + this.bonusDesc);},
	'bonusLevel':function(lvl){return(lvl);},
	'bonusDesc':' Starting Zone after Ascension',
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
	return(optimalLevel > 0 ? Math.round(optimalLevel) : 0);
}

function supportsHtml5Storage()	{
	try	{
		return 'localStorage' in window && window['localStorage'] !== null;
	}
	catch(e)	{
		return false;
	}
}

function getCookie(cname)	{
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i].trim();
		if (c.contains(name) == 0)	{
			var cvalue = c.substring(name.length,c.length);
			return(cvalue);
		}
	}
	return "";
}

function setCookie(cname, cvalue, expDays) {
	if(expDays === undefined)	{
		document.cookie = cname.toString() + "=" + cvalue.toString();
	}
	else	{
		var expirationDate = new Date();
		expirationDate.setTime(expirationDate.getTime() + (expDays*millisecondsPerDay));
		document.cookie = cname.toString() + "=" + cvalue.toString() + "; expires="+expirationDate.toUTCString();
	}
}

function getSetting(pname)	{
	var value;
	if(supportsHtml5Storage())	{
		try	{
		if(localStorage.getItem(pname) !== null)	{
	// var value = supportsHtml5Storage() && localStorage.getItem(pname) !== null ? localStorage.getItem(pname) : getCookie(pname);
			value = localStorage.getItem(pname);
		}
		else	{
			value = getCookie(pname);
		}
		}
		catch(e)	{
			value = getCookie(pname);
		}
	}
	else	{
		value = getCookie(pname);
	}
	$('#'+pname).prop('checked', value == "true");
	return value;
}

function saveSetting(name, value)	{
	var sValue = (value === undefined ? $('#'+name).is(':checked') : value);

	if(supportsHtml5Storage())	{
		localStorage.setItem(name, sValue);
	}
	else	{
		setCookie(name, sValue);
	}
}

function loadSettings()	{
	getSetting("noBossLanding");
	getSetting("laxsolo");
	getSetting("ignoreIris");
	playstyle = getSetting("playstyle");
	playstyle = playstyle == "" ? 'idle' : playstyle;
	$('input[type=radio][name=playstyle]').val([playstyle]);
	if(getSetting('hideOptions')=='true')	{
		toggle_options();
	}
}

function saveSettings()	{
	saveSetting("noBossLanding");
	saveSetting("laxsolo");
	saveSetting("ignoreIris");
	saveSetting("playstyle", $('input[type=radio][name=playstyle]:checked').val());
}

function loadStats(totalSouls)	{
	var currentDate = new Date();
	var today = currentDate.getTime();
	var yesterday = today - 1*millisecondsPerDay;
	var dbyesterday = today - 2*millisecondsPerDay;
	var lastWeek = today - 7*millisecondsPerDay;
	var lastMonth = today - 30*millisecondsPerDay;

	var history = [];

	if(supportsHtml5Storage())	{
		for(var key in localStorage)	{
			if(key.substring(0,4) == "hist")	{
				history.push({date:parseInt(key.substring(4)),hs:parseInt(localStorage[key])});
			}
		}
	}
	else	{
		var cookies = document.cookie.split(';');
		for(var i=0; i<cookies.length; i++) {
			var cookie = cookies[i].trim().split('=');
			var cname = cookie[0];
			if(cname.substring(0,4) == "hist")	{
				var hist = { date: parseInt(cname.substring(4)), hs: parseInt(parseInt(cookie[1])) };
				history.push(hist);
			}
		}
	}

	history.sort( function(a,b) { return a.date-b.date; } );

	var dayLast = today;
	var ydayLast = today;
	var weekLast = today;
	var monthLast = today;

	var historystring = "<u>Hero Souls (end of day)</u><br><br><table class=\"history\"><tr class=\"history\"><th>Date</th><th>Total HS</th><th>Difference</th></tr>";
	var previousHS = 0;
	var lastEntry;
	for(var entry in history)	{
		var hist = history[entry];
		if(hist.date > lastMonth)	{
			var entryDate = new Date();
			entryDate.setTime(hist.date-millisecondsPerDay);
			historystring += "<tr class=\"history\"><td>" + entryDate.getFullYear()+"-"+(entryDate.getMonth()+1).padZero(2)+"-"+entryDate.getDate().padZero(2) + "</td><td>" + hist.hs.numberFormat() + "</td><td>" + ((previousHS==0)?"&mdash;":((hist.hs-previousHS>0)?"+":"")+(hist.hs-previousHS).numberFormat()) + "</td></tr>";

			if((hist.date <= dayLast || dayLast == today) && hist.date > yesterday)	{
				dayLast = entry;
			}
			if((hist.date <= ydayLast || ydayLast == today) && hist.date > dbyesterday)	{
				ydayLast = entry;
			}
			if((hist.date <= weekLast || weekLast == today) && hist.date > lastWeek)	{
				weekLast = entry;
			}
			if((hist.date <= monthLast || monthLast == today) && hist.date > lastMonth)	{
				monthLast = entry;
			}

			lastEntry = entry;
		}
		previousHS = hist.hs;
	}
	historystring += "</table>";

	$('#hshistory').attr("onmouseover", "nhpup.popup('"+historystring+"', {'width':'auto'});");

	var hsToday = totalSouls-history[dayLast].hs;
	var hsYesterday = history[dayLast].hs-history[ydayLast].hs;
	var hsLastWeek = totalSouls-history[weekLast].hs;
	var hsLastMonth = totalSouls-history[monthLast].hs;

	// totals
	$('#hstoday').text(hsToday.numberFormat());
	$('#hsyday').text(hsYesterday.numberFormat());
	$('#hsweek').text(hsLastWeek.numberFormat());
	$('#hsmonth').text(hsLastMonth.numberFormat());

	// per day
	$('#hstpday').text((hsToday / ((today-history[dayLast].date)/millisecondsPerDay)).numberFormat());
	$('#hsypday').text(hsYesterday.numberFormat());
	$('#hswpday').text((hsLastWeek / ((today-history[weekLast].date)/millisecondsPerDay)).numberFormat());
	$('#hsmpday').text((hsLastMonth / ((today-history[monthLast].date)/millisecondsPerDay)).numberFormat());

	// per hour
	$('#hstphour').text((hsToday / ((today-history[dayLast].date)/millisecondsPerHour)).numberFormat());
	$('#hsyphour').text((hsYesterday / 24).numberFormat());
	$('#hswphour').text((hsLastWeek / ((today-history[weekLast].date)/millisecondsPerHour)).numberFormat());
	$('#hsmphour').text((hsLastMonth / ((today-history[monthLast].date)/millisecondsPerHour)).numberFormat());

	var chartData = {
		labels: [],
		datasets: [
			{
				label: "HS",
				fillColor: "rgba(151,187,205,0.2)",
				strokeColor: "rgba(151,187,205,1)",
				pointColor: "rgba(151,187,205,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(151,187,205,1)",
				data: []
			},
			{
				label: "30-day average",
				fillColor: "rgba(192,0,0,0)",
				strokeColor: "rgba(192,0,0,0.5)",
				pointColor: "rgba(192,0,0,0.0)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(192,0,0,0.5)",
				data: []
			}
		]
	};

	previousHS = 0;
	var first=true;
	var monthAvg = Math.round(hsLastMonth/((today-history[monthLast].date)/millisecondsPerDay));
	var order=monthAvg > 1 ? Math.floor(Math.log10(monthAvg)/3) : 0;
	var scale=Math.pow(10,order*3);

	var suffix=["","K","M","B","T","Q"];

	var nextDate;
	for(var entry in history)	{
		var hist = history[entry];
		if(nextDate !== undefined)	{
			for(var dt=nextDate; dt < hist.date; dt += millisecondsPerDay)	{
				var skipDate = new Date();
				skipDate.setTime(dt-millisecondsPerDay);
				chartData.datasets[0].data.push(0);
				chartData.datasets[1].data.push(first || entry == lastEntry ? monthAvg : null)
				chartData.labels.push(skipDate.getDate());
			}
		}
		if(hist.date > lastMonth)	{
			var entryDate = new Date();
			entryDate.setTime(hist.date-millisecondsPerDay);

			if(previousHS != 0)	{
				chartData.datasets[0].data.push(hist.hs-previousHS);
				chartData.datasets[1].data.push(first || entry == lastEntry ? monthAvg : null)
				chartData.labels.push(entryDate.getDate());
				first = false;
			}
			nextDate = hist.date + millisecondsPerDay;
		}
		previousHS = hist.hs;
	}

	var ctx = document.getElementById("hschart").getContext("2d");
	$('#trchart').toggle(true);
	var historyChart = new Chart(ctx).Line(chartData, {animation:true,animationSteps:30,scaleFontSize:10,pointDotRadius:3,scaleLabel: "<%=value/"+scale.toString()+"%>"+suffix[order],animationEasing:"easeOutElastic",responsive:false,pointHitDetectionRadius:5,scaleBeginAtZero:false});
}

function saveStats(totalSouls)	{
	var tomorrow = new Date();

	tomorrow.setHours(0,0,0,0);
	if(getSetting("hist"+tomorrow.getTime()) == "")	{
		saveSetting("hist"+tomorrow.getTime(), totalSouls);
	}

	tomorrow.setHours(24,0,0,0);
	saveSetting("hist"+tomorrow.getTime(), totalSouls);
}

function migrateStats()	{
	if(supportsHtml5Storage())	{
		if(localStorage.getItem("migrated") != "true")	{
			var cookies = document.cookie.split(';');
			for(var i=0; i<cookies.length; i++) {
				var cookie = cookies[i].trim().split('=');
				var cname = cookie[0];
				if(cname.substring(0,4) == "hist")	{
					localStorage.setItem(cname, cookie[1]);
				}
			}

			localStorage.setItem("migrated", "true");
		}
	}
}

function processStats(totalSouls)	{
	migrateStats();
	saveStats(totalSouls);
	loadStats(totalSouls);
}

function optimize()	{
	var Bank = anc[0];
	var Siya = anc[5];
	var Fragsworth = anc[19];
	var Argaiv = anc[28];
	var Iris = anc[30];

	playstyle = $('input[type=radio][name=playstyle]:checked').val();
	var clicking = playstyle != 'idle';
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
		ancient.levelOld = Math.floor($('#old'+key).val());
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
		referenceLevel = Math.max(playstyle=='active' ? Fragsworth.levelNew : Siya.levelNew, 1);
		var desiredBank = Math.ceil(Bank.levelNew-Bank.desiredLevel(referenceLevel));
		var nextBank = Math.ceil(Bank.levelNew-Bank.desiredLevel(referenceLevel+1));

		for(key in anc)	{
			var ancient = anc[key];
			var optimal = getOptimal(ancient, referenceLevel);
			if(ancient.levelNew > 0 && optimal > ancient.levelNew && (clicking == true || ancient.clicking == false) && (ignoreIris == false || key != 30))	{
				// Do not process ancients the user doesn't have.
				// Do not process clicking ancients when clicking checkbox is off.
				// Do not process Iris if disabled.

				var upgradeCost = ancient.upgradeCost(ancient.levelNew+1);

				if(upgradeCost <= (key==5 || key==28 ? nextBank : desiredBank))	{	// always keep the desired soulbank, do not spend below this
					// determine the ancient that is lagging behind the most (biggest relative increase from current to optimal)
					var increase = (optimal-ancient.levelNew) / ancient.levelNew;

					// assign less weight to Siya/Arga to let other ancients catch up first, only upgrade when no other ancients to upgrade
					if(playstyle == 'active' && key == 28)	{
						increase *= 0.1;
					}
					else if(playstyle != 'active' && key == 5)	{
						increase *= 0.1;
					}

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
				var morgPlus = Math.min(Math.ceil((highestIncrease - nextBestIncrease)*ancient.levelNew), Bank.levelNew);
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
		var optimalLevel = getOptimal(ancient, (key == 5 && playstyle!='active' || key == 28 && playstyle=='active') ? referenceLevel-1 : referenceLevel);

		if((ancient.maxLevel != 0 && ancient.levelOld == ancient.maxLevel) || (optimalLevel == 0 && ancient.levelOld == 0 && key != 0) || (playstyle=='idle' && ancient.clicking))	{
			$('#anc'+key).css('display', 'none');
		}
		else	{
			$('#anc'+key).css('display', 'table-row');

			$('#new'+key).text(ancient.levelNew);
			$('#optimal'+key).text(optimalLevel);

			if(ancient.levelNew != ancient.levelOld)	{
				$('#delta'+key).text(ancient.levelNew - ancient.levelOld);
				if(key != 0)	{
					$('#delta'+key).attr("onmouseover", "nhpup.popup('"+ancient.Name+" upgrade cost:<br>"+ancient.totalCost.numberFormat()+" soul"+plural(ancient.totalCost)+"');");
				}
				$('#name'+key).attr("onmouseover", "nhpup.popup('<u>Current level:</u><br>"+ancient.getBonus(ancient.levelOld)+"<br><br><u>Target level:</u><br>"+ancient.getBonus(ancient.levelNew)+"');");
			}
			else	{
				$('#delta'+key).text('');
				$('#delta'+key).removeAttr("onmouseover");

				if(ancient.levelOld > 0)	{
					$('#name'+key).attr("onmouseover", "nhpup.popup('<u>Current level:</u><br>"+ancient.getBonus(ancient.levelOld)+"');");
				}
				else	{
					$('#name'+key).attr("onmouseover", "nhpup.popup('<u>"+ancient.Name+"</u><br>First level: "+ancient.getBonus(1)+"');");
				}
			}
		}
	}
	permaLink();
	saveSettings();
}

function import_save(evt) {

	if(evt && evt.keyCode == 17)	{
		// releasing Ctrl after Ctrl-V would trigger the import_save function twice, and also run optimize twice.
		// Ignore the Ctrl key release.
		return;
	}

	var txt = $('#savegame').val();

	if(txt.contains("Fe12NAfA3R6z4k0z")) {
		var result = txt.split("Fe12NAfA3R6z4k0z");
		txt = "";
		for (var i = 0; i < result[0].length; i += 2) {
			txt += result[0][i];
		}
		if (CryptoJS.MD5(txt + "af0ik392jrmt0nsfdghy0") != result[1]) {
			$('#savegame').attr('class', 'error');
			return;
		}
		else	{
			$('#savegame').removeAttr('class', '');
		}

		data = $.parseJSON(atob(txt));

		var totalSoulsSpent = 0;
		for(ancient in data.ancients.ancients)	{
			totalSoulsSpent += Math.floor(data.ancients.ancients[ancient].spentHeroSouls);
		}

		// count hero levels for Souls gained on ascension and accumulate Gilds
		var totalHeroLevels = 0;
		for(hero in data.heroCollection.heroes)	{
			totalHeroLevels += data.heroCollection.heroes[hero].level;
			totalGilds += data.heroCollection.heroes[hero].epicLevel;
		}
		data.primalSouls += (Math.floor(totalHeroLevels/2000));

		for(key in anc)	{
			var ancient = anc[key];

			if(key == 0)	{
				var IncludeSoulsAfterAscension = (data.heroSouls==0 || window.location.href.contains('?primalsouls=1'));
				$('#primalsouls').prop('checked', IncludeSoulsAfterAscension);
				ancient.levelOld = Math.floor(IncludeSoulsAfterAscension ? data.heroSouls+data.primalSouls : data.heroSouls);
			}
			else	{
				if(data.ancients.ancients.hasOwnProperty(key))	{
					ancient.levelOld = Math.floor(data.ancients.ancients[key].level);
				}
				else	{
					ancient.levelOld = 0;
				}
			}
			$('#old'+key).val(ancient.levelOld);
		}

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

		$('#primalsouls').attr('disabled', false);
		$('#irisBonus').prop('value', irisBonus);

		$('#relicfound').prop('textContent', (data.items.gotAscensionItem ? "Yes" : "No"));
		var itemBonusZone = getBonusZone();
		$('#reliczone').prop('textContent', itemBonusZone > 0 ? itemBonusZone.numberFormat() : "Ascension required");
		$('#reliclevel').prop('textContent', itemBonusZone > 0 ? getRelicLevel(itemBonusZone) : "-");

		$('#soulsspent').text(totalSoulsSpent.numberFormat());
		$('#worldresets').text(data.numWorldResets.numberFormat());
		$('#hze').text(data.highestFinishedZonePersist.numberFormat());
		$('#titandamage').text(data.hasOwnProperty('titanDamage') ? Math.floor(data.titanDamage).numberFormat() : "CH v0.20+ only");

		//processStats(totalSoulsSpent + data.heroSouls + data.primalSouls + data.ancients.rerollSoulsSpent);
		processStats(totalSoulsSpent + data.heroSouls + data.ancients.rerollSoulsSpent);
		optimize();
	}
	else	{
		$('#savegame').prop('class', txt=='' ? '' : 'error');
	}
}

function permaLink()	{
	var url=window.location.pathname;
	for(key in anc)	{
		var ancient=anc[key];
		if(ancient.levelOld > 0)	{
			url += "?a" + key + "=" + ancient.levelOld;
		}
	}
	url+="?st="+$('#irisBonus').val();
	$('#permalink').html("<a href='"+url+"'>Permalink</a>");
}

function parseUrl()	{
	var options = window.location.search.split("?");
	if(options.length > 1)	{
		var doOptimize=false;
		for(option in options)	{
			var arg=options[option].split("=");
			if(arg.length==2)	{
				var argname=arg[0];
				var argval=parseInt(arg[1]);
				if(!isNaN(argval))	{
					if(/a\d+/.test(argname))	{
						var key=parseInt(argname.substring(1));
						if(key in anc)	{
							var ancient=anc[key];
							$('#old'+key).val(argval);
							$('#anc'+key).css('display', (ancient.maxLevel != 0 && argval == ancient.maxLevel) ? 'none' : 'table-row');
							doOptimize=true;
						}
					}
					else if(/st/.test(argname))	{
						$('#irisBonus').prop('value', argval);
					}
				}
			}
		}
		if(doOptimize)	{
			optimize();
		}
	}
}

function init()	{
	loadSettings();
	document.getElementById('theme').value=getSetting('theme');
	parseUrl();
}
