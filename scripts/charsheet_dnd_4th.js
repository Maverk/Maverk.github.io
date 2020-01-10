function setConfirmUnload(on){
    window.onbeforeunload = (on) ? unloadMessage: null;
}
function unloadMessage(){
    return 'You have changes since you last saved. Are you sure you want to continue?';
}
$(document).ready(function(){
	$('.content:input').change(function(){
		setConfirmUnload(true);
	    });
    });

function isNumber (o) {
  return ! isNaN (o-0) && o != null;
}

function calcValues(){
    $('input').removeClass('error');
    $('input').removeClass('warning');

    calcAbilityScores();
    calcArmor();
    calcMax();
    calcMultipliers();
    calcSums();
}

function getValuesFromSource(sources){
    var sourceSplit = sources.split(' ');
    var ret = [];
    for(var i = 0; i < sourceSplit.length; i++){
        var source = sourceSplit[i];
        if(isNumber(source)){
            ret.push(parseFloat(source));
        } else {
            var cur = $('#i-' + source);
            if(cur.hasClass('error')){
                return null;
            }
            if(!cur.is(':checkbox') || cur.prop('checked')){
                var val = cur.val();
                if(val != ''){
                    if(isNumber(val))
                        ret.push(parseFloat(val));
                    else
                        return null;
                }
            }
        }
    }
    return ret;
}

function calcArmor(){
    var elem = $('#i-ac_abil');
    if($('#i-armor_abil').is(':checked')){
        var cur = -1000;
        var values = getValuesFromSource('dex int');
        if(values == null) {
            elem.addClass('error');
            return;
        }
        for(var i = 0; i < values.length; i++){
            if(values[i] > cur)
                cur = values[i];
        }
        elem.val(Math.floor(cur));
    } else {
        elem.val(0);
    }
}

function calcMax(){
    $('input.max').each(function(){
            var cur = -1000;
            var values = getValuesFromSource($(this).attr('source'));
            if(values == null) {
            $(this).addClass('error');
            return;
            }
            for(var i = 0; i < values.length; i++){
            if(values[i] > cur)
            cur = values[i];
            }
            $(this).val(Math.floor(cur));
            });
}


function calcMultipliers(){
    $('input.mult').each(function(){
            var product = 1;
            var values = getValuesFromSource($(this).attr('source'));
            if(values == false) {
            $(this).addClass('error');
            return;
            }
            for(var i = 0; i < values.length; i++){
            product *= values[i];
            }
            $(this).val(Math.floor(product));
            });
}

function calcAbilityScores(){
    var scoreNames = ['str', 'con', 'dex', 'int', 'wis', 'cha'];
    for(var i = 0; i < scoreNames.length; i++){
        var score = $('#i-' + scoreNames[i] + '_score').val();
        if(score == '' || !isNumber(score)){
            $('#i-' + scoreNames[i] + '_score').addClass('error');
            $('#i-' + scoreNames[i]).val('').addClass('error');
            continue;
        }
        score = parseInt(score);

        var mod = 0;
        if(score <= 1) mod = -5;
        else mod = Math.floor((score - 10) / 2);
        $('#i-' + scoreNames[i]).val(mod);
    }
}
function calcSums(){
    $('input.sum').each(function(){
            var values = getValuesFromSource($(this).attr('source'));
            if(values == null) {
            $(this).addClass('error');
            return;
            }

            var sum = 0;
            for(var i = 0; i < values.length; i++){
            sum += values[i];
            }
            $(this).val(Math.floor(sum));
            });
    $('input.sum-rest').each(function(){
            var inputs = $(this).closest('tr').find('input').not('#' + $(this).prop('id'));
            var sources = '';
            for(var i = 0; i < inputs.length; i++){
            sources += $(inputs).eq(i).attr('name') + ' ';
            }
            if(sources.length > 0) sources = sources.substring(0, sources.length - 1);
            var values = getValuesFromSource(sources);
            if(values == null) {
            $(this).addClass('error');
            return;
            }
            var sum = 0;
            for(var i = 0; i < values.length; i++){
            sum += values[i];
            }
            $(this).val(Math.floor(sum));
            });
}

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function saveCharacter(){
    var altId = $('#save-id').val();
    if(! isNaN(altId) && altId != "") {
        alert('The alternate id cannot be a number.');
        $('#save-id').focus();
        return;
    }

    if(confirm('Are you sure you want to save this character?')){
        var text = JSON.stringify($('#mainform').serializeObject());
        var result = $.post('https://kevinleung.com/dnd/action.php', {
                'action': 'saveCharacter',
                'sheettext': text,
                'alt_id': altId
                }, function(response){
            if(response == 'COOLDOWN')
                alert('Please wait a few seconds before saving your character again.');
            else {
                $('#load-id').val(response);
                setConfirmUnload(false);
            }
            });
        }
}

function loadCharacter(val){
    $.get('https://kevinleung.com/dnd/action.php', {
            'action': 'loadCharacter',
            'id': val}, function(response){
	    if(response == ''){
		alert('No data found');
		return;
	    }
	    var results = $.parseJSON(response);
	    $('#mainform input:text').val('');
	    $('#mainform textarea').val('');
	    $('#mainform input:checkbox').prop('checked', false);
	    for(var key in results){
		var elem = $('#i-' + key);
		if(elem.length == 0){
		    console.debug('error for ' + key);
		} else {
		    if(elem.is(':checkbox'))
			elem.prop('checked', results[key] != '');
		    else
			elem.val(results[key]);
		}
	    }
	    $('textarea').trigger('change');
	    setConfirmUnload(false);
	});
}

function resetEncounter(){
    $('.reset-enc').prop('checked', false);
}

function resetDaily(){
    $('.reset-daily').prop('checked', false);
    $('#i-surges_used').val('0');

}

$(document).ready(function(){
	var navString = '';
	$('.section').each(function(){
		var id = $(this).prop('id');
		var label = $(this).find('h3').text();
		navString += '<li><a href="#' + id + '">' + label + '</a>';
	    });
	$('.nav').html(navString);

	$('#calc-btn').click(calcValues);
	$('#save-btn').click(saveCharacter);
	$('#load-btn').click(function(){
		if($('#load-id').val() != '' && confirm('Are you sure you want to load? This will erase all data currently in the character sheet.')){
		    loadCharacter($('#load-id').val());
		}
	    });
	$('#reset-enc-btn').click(resetEncounter);
	$('#reset-daily-btn').click(resetDaily);

	$(':input').change(function(){
		$('input[source*="' + $(this).attr('name') + '"]').addClass('warning');
		if(! $(this).hasClass('sum-rest'))
		    $(this).closest('tr').find('.sum-rest').addClass('warning');
	    });

	$(window).resize(function(){
		if($('.header').outerHeight() + $('.toolbox').height() > $(window).height())
		    $('.toolbox').css('position', 'relative');
		else
		    $('.toolbox').css('position', 'fixed');

	    }).trigger('resize');
    });

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

$(document).ready(function(){
	var id = getUrlVars()['id'];
	if(isNumber(id)){
	    loadCharacter(id);
	    $('#load-id').val(id);
	}

	$('textarea').autogrow().trigger('change');
	/*
	$('textarea.expand').prop('rows', 1);
	$('textarea.expand').focusin(function(){
		$(this).prop('rows', 4);
	    });
	$('textarea.expand').focusout(function(){
		$(this).prop('rows', 1);
		    });
	*/
    });
