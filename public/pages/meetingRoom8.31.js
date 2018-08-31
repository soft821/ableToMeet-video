/********************************************************
*
*
*
********************************************************/

// ====================================================== //
$(function(){
	if ($('#isHost').attr('data-value') == "true") {
		$('#open-room').click();
		console.log('host');
	} else {
		$('#room-id').val($('#joinId').attr('data-value'));
		console.log('joinid',$('#joinId').attr('data-value'));
		console.log('roomid',$('#room-id').val());
		$('#join-room').click();
		console.log('join');
	}
		
	
	$('#joined-video-container').owlCarousel({
        items: 5,
        // loop: true,
        // autoplayHoverPause: true,
        // autoplay: true,
        responsive: {
            0: {
                items: 1
            },
            455: {
                items: 2
            },            
            768: {
                items: 3,
            },
            991: {
                items: 4,
            },
            1024: {
                items: 5,
            }
        }
    });
    $('#joined-video-container').on('mousewheel', '.owl-stage', function (e) {
	    if (e.deltaY>0) {
	        $('#joined-video-container').trigger('next.owl');
	    } else {
	        $('#joined-video-container').trigger('prev.owl');
	    }
	    e.preventDefault();
	});
});

// Toggle Chat Area
$(document).on('click', '#btn-chat', function(){
	if ($('body').hasClass('open-chat')) {
		$('body').removeClass('open-chat');
	} else {
		$('body').addClass('open-chat');
	}
});

// End Video Conference
$(document).on('click', '#btn-end-meeting', function(){
	location.href = '/host';
});

var connection = new RTCMultiConnection();

$(document).on('click', '#btn-mute', function(){
	if($(this).hasClass('on')) {
		$(this).removeClass('on');
		$(this).find('.ctrl-icon').attr('src','images/icons/mic-off.png');
		$(this).find('.ctrl-title').text('Start Audio');
		var localStream = connection.attachStreams[0];
    	localStream.mute('audio');
	} else {
		$(this).addClass('on');
		$(this).find('.ctrl-icon').attr('src','images/icons/mic-on.png');
		$(this).find('.ctrl-title').text('Stop Audio');
		var localStream = connection.attachStreams[0];
    	localStream.unmute('audio');
	}
});

$(document).on('click', '#btn-vstop', function(){
	if($(this).hasClass('on')) {
		$(this).removeClass('on');
		$(this).find('.ctrl-icon').attr('src','images/icons/camera-off.png');
		$(this).find('.ctrl-title').text('Start Video');
		var localStream = connection.attachStreams[0];
    	localStream.mute('video');
	} else {
		$(this).addClass('on');
		$(this).find('.ctrl-icon').attr('src','images/icons/camera-on.png');
		$(this).find('.ctrl-title').text('Stop Video');
		var localStream = connection.attachStreams[0];
    	localStream.unmute('video');
	}
});

$(document).on('click', '#btn-share', function(){
	// this.disabled = true;
    connection.addStream({
        screen: true,
        oneway: true
    });
});

















// ======================================================= //
// ======================================================= //
// ======================================================= //

  // ......................................................
// .......................UI Code........................
// ......................................................
$(document).on('click','#open-room',function(){
	$('#cover-img').addClass('hidden');
	$('#loading').removeClass('hidden');
	this.disabled = true;
    console.log('room-id',document.getElementById('room-id').value);
    connection.open(document.getElementById('room-id').value);
});
$(document).on('click','#join-room',function(){
	$('#loading').removeClass('hidden');
	this.disabled = true;
    connection.join(document.getElementById('room-id').value);
});
$(document).on('click','#open-or-join-room',function(){
	this.disabled = true;
    connection.openOrJoin(document.getElementById('room-id').value);
});
// ......................................................
// ................FileSharing/TextChat Code.............
// ......................................................
$(document).on('keyup', '#input-text-chat', function(e){
	if(e.keyCode != 13) return;
    sendMsg();
});
$(document).on('click', '#btn-send-chat', function(e){
	sendMsg();
});
function sendMsg(){
	var chat_input = $('#input-text-chat');
    // removing trailing/leading whitespace
    // chat_input.value = chat_input.value.replace(/^\s+|\s+$/g, '');
    if (!chat_input.val()) return;
	connection.send(chat_input.val());
    // appendDIV(chat_input.val());
    appendOutMsg(chat_input.val());
    chat_input.val('');
}
var chatContainer = document.querySelector('.chat-output');
function appendOutMsg(event) {
	console.log('msg',event);
	var msg = event.data || event;

	if (typeof(event) == "string") {
		var user_name = document.getElementById('current_user').outerText;
		var createdAt = (new Date).toLocaleDateString() + ' at ' + (new Date).toLocaleTimeString();
	} else {
		var user_name = event.extra.username;
		var createdAt = event.extra.createdAt;
	}
		
	var OutMsg = '<div class="out-msg">'+
					'<div class="user-info">'+
						'<img src="images/icons/default-user.png" class="user-avatar" />'+
						// '<span class="user-name">'+ user_name +'</span>'+
						'<span class="timestamp">'+ createdAt +'</span>'+
					'</div>'+
					'<div class="msg">'+
						msg +
					'</div>'+
				'</div>';
	var InMsg = '<div class="in-msg">'+
					'<div class="user-info">'+
						'<img src="images/icons/default-user.png" class="user-avatar" />'+
						'<span class="user-name">'+ user_name +'</span>'+
						'<span class="timestamp">'+ createdAt +'</span>'+
					'</div>'+
					'<div class="msg">'+
						msg +
					'</div>'+
				'</div>';
	if (event.data) {
		chatContainer.append($.parseHTML(InMsg)[0]);
	} else {
		chatContainer.append($.parseHTML(OutMsg)[0]);
	}
    
    document.getElementById('input-text-chat').focus();
}
// function appendDIV(event) {
//     var div = document.createElement('div');
//     div.innerHTML = event.data || event;
//     chatContainer.insertBefore(div, chatContainer.firstChild);
//     div.tabIndex = 0; div.focus();
    
//     document.getElementById('input-text-chat').focus();
// }

$(document).on('click','#share-file',function(){
	var fileSelector = new FileSelector();
    fileSelector.selectSingleFile(function(file) {
        connection.send(file);
    });
});


// ......................................................
// ..................RTCMultiConnection Code.............
// ......................................................
var connection = new RTCMultiConnection();
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connection.enableFileSharing = true; // by default, it is "false".
connection.session = {
    audio: true,
    video: true,
    data : true
};
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

// Using getScreenId.js to capture screen from any domain
// You do NOT need to deploy Chrome Extension YOUR-Self!!
connection.getScreenConstraints = function(callback) {
    getScreenConstraints(function(error, screen_constraints) {
        if (!error) {
            screen_constraints = connection.modifyScreenConstraints(screen_constraints);
            callback(error, screen_constraints);
            return;
        }
        throw error;
    });
};


connection.onstream = function(event) {
	console.log('11', event);
	console.log('22', event.mediaElement);
    // document.body.appendChild(event.mediaElement);
	// Hide Loading / Logo Images
	$('#loading').addClass('hidden');
	$('#cover-img').addClass('hidden');
	// Add Video Stream into Video Container
	event.mediaElement.controls = false;
	var mediaElement = '<div class="media-element">'+
							'<div class="media-box '+ event.streamid +'"></div>'+
							'<div class="media-controls row">'+
								'<div class="media-username col-md-8">'+ event.extra.username +'</div>'+
								'<div class="control-fullscreen col-md-4"><img class="pull-right" data-id="'+ event.streamid +'" src="images/icons/full-screen-white.png" /></div>'+
							'</div>'+
						'</div>';

    if ($('#video-me video').length == 0) {
    	$('#video-me').append(mediaElement);
    	document.getElementsByClassName(event.streamid)[0].appendChild(event.mediaElement);
    } else if ($('#video-focus video').length == 0) {
		$('#video-focus').append(mediaElement);
    	document.getElementsByClassName(event.streamid)[0].appendChild(event.mediaElement);
    } else {
    	$('#joined-video-container').trigger('add.owl.carousel', [mediaElement]).trigger('refresh.owl.carousel');
    	document.getElementsByClassName(event.streamid)[0].appendChild(event.mediaElement);
    }
    console.log('ok');
};
// when stream ended
connection.onstreamended = function(event) {
	console.log('streamend', event);
	console.log('parentNode', document.getElementById(event.streamid).parentNode.parentNode.parentNode);
	// getElementsByClassName(event.streamid)[0].
    if (document.getElementById(event.streamid).parentNode.parentNode.parentNode.id == 'video-focus') {
    	$('#video-focus .media-element').remove();
    	console.log('end1');
    } else {
    	event.mediaElement.parentNode.parentNode.parentNode.className = 'owl-item ended';
    	var endedIndex = $('.owl-item.ended').index();
    	console.log(endedIndex);
    	$(".owl-carousel").trigger('remove.owl.carousel', [endedIndex]).trigger('refresh.owl.carousel');
    }


    // var mediaElement = document.getElementById(event.streamid);
    // if(mediaElement) {
    //     mediaElement.parentNode.removeChild(mediaElement);
    // }
};

connection.extra = {
	username: document.getElementById('current_user').outerText,
	createdAt: (new Date).toLocaleDateString() + ' at ' + (new Date).toLocaleTimeString()
}
// connection.onmessage = appendDIV;
connection.onmessage = appendOutMsg;
connection.filesContainer = document.getElementById('file-container');
connection.onopen = function() {
    document.getElementById('share-file').disabled      = false;
    document.getElementById('input-text-chat').disabled = false;
};

$(document).on('click', '.owl-item', function(e){
	var focusVideo = $('#video-focus video')[0];
	var focusMediaElement = '<div class="media-element">'+
							'<div class="media-box '+ focusVideo.id +'"></div>'+
							'<div class="media-controls row">'+
								'<div class="media-username col-md-8">'+ focusVideo.parentNode.parentNode.childNodes[1].childNodes[0].outerText +'</div>'+
								'<div class="control-fullscreen col-md-4"><img class="pull-right" data-id="'+ focusVideo.id +'" src="images/icons/full-screen-white.png" /></div>'+
							'</div>'+
						'</div>';


	// var focusObj = $('#video-focus .media-element');

	var indexToRemove = $(this).index();
	var selectedVideo = $('.owl-carousel video')[indexToRemove];
// debugger;
	var selectedMediaElement = '<div class="media-element">'+
							'<div class="media-box '+ selectedVideo.id +'"></div>'+
							'<div class="media-controls row">'+
								'<div class="media-username col-md-8">'+ selectedVideo.parentNode.parentNode.childNodes[1].childNodes[0].outerText +'</div>'+
								'<div class="control-fullscreen col-md-4"><img class="pull-right" data-id="'+ selectedVideo.id +'" src="images/icons/full-screen-white.png" /></div>'+
							'</div>'+
						'</div>';


	console.log('indexToRemove',indexToRemove);
	$('#video-focus').html(selectedMediaElement);
	document.getElementsByClassName(selectedVideo.id)[0].appendChild(selectedVideo);
	document.getElementById(selectedVideo.id).play();
	e.preventDefault();
	// carousel.to(carousel.relative($(this).index()));

	// update owl-carousel
	$(".owl-carousel").trigger('remove.owl.carousel', [indexToRemove]).trigger('refresh.owl.carousel');
	$('#joined-video-container').trigger('add.owl.carousel', [focusMediaElement]).trigger('refresh.owl.carousel');
	document.getElementsByClassName(focusVideo.id)[0].appendChild(focusVideo);
	document.getElementById(focusVideo.id).play();


	console.log('change');
});

$(document).on('dblclick', 'video', function(e){
	goFullscreen(this.id);
});

$(document).on('click', '.control-fullscreen img', function(){
	goFullscreen($(this).attr('data-id'));
});

function goFullscreen(id) {
  var element = document.getElementById(id);       
  if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }  
}