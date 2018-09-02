/********************************************************
*
* Video Conferencing Demo1.0 JAVASCRIPT PART 2018/8/31
*
********************************************************/

// ====================================================== //
$(function(){
	// auto host & join at first
	if ($('#isHost').attr('data-value') == "true") {
		$('#cover-img').addClass('hidden');
		$('#loading').removeClass('hidden');
		$('#open-room')[0].disabled = true;
	    connection.open(document.getElementById('room-id').value);
	} else {
		$('#room-id').val($('#joinId').attr('data-value'));
		checkPresenceAndJoin(document.getElementById('room-id').value);
	}
	// owl-carousel init for jonied videos
	$('#joined-video-container').owlCarousel({
        items: 5,
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

// ============================== //
// Meeting Room Control Part
// ============================== //
// Toggle Chat Area
$(document).on('click', '#btn-chat', function(){
	if ($('body').hasClass('open-chat')) {
		$('body').removeClass('open-chat');
	} else {
		$('body').addClass('open-chat');
	}
});

// End Meeting
$(document).on('click', '#btn-end-meeting', function(){
	location.href = '/host';
});

// check presence of meeting room
function checkPresenceAndJoin(roomid){
	connection.checkPresence(roomid, function(isRoomEists, roomid){
		if(isRoomEists) {
			$('#loading').removeClass('hidden');
			$('#join-room')[0].disabled = true;
			connection.join(roomid);
		}
		else {
			toastr.error("Hosted Room Doesn't Exist.");
			setTimeout(function(){
				window.location.href = '/join';
			}, 3000);
		}
	});
}

// auto host & join meeting room
$(document).on('click','#open-or-join-room',function(){
	this.disabled = true;
    connection.openOrJoin(document.getElementById('room-id').value);
});

// ============================ //
// Video Stream Control Part
// ============================ //
// my audio stop & start
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

// my video stop & start
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

// btn event for share screen in meeting room
$(document).on('click', '#btn-share', function(){
	console.log('sharebtn');
    connection.addStream({
        screen: true,
        oneway: true
    });
});

// when click video item, focus processing
$(document).on('click', '.owl-item', function(e){
	var focusVideo = $('#video-focus video')[0];
	if (focusVideo) {
		var focusMediaElement = '<div class="media-element">'+
								'<div class="media-box '+ focusVideo.id +'"></div>'+
								'<div class="media-controls row">'+
									'<div class="media-username col-md-8">'+ focusVideo.parentNode.parentNode.childNodes[1].childNodes[0].outerText +'</div>'+
									'<div class="control-fullscreen col-md-4"><img class="pull-right" data-id="'+ focusVideo.id +'" src="images/icons/full-screen-white.png" /></div>'+
								'</div>'+
							'</div>';
	}

	var indexToRemove = $(this).index();
	var selectedVideo = $('.owl-carousel video')[indexToRemove];
	var selectedMediaElement = '<div class="media-element">'+
							'<div class="media-box '+ selectedVideo.id +'"></div>'+
							'<div class="media-controls row">'+
								'<div class="media-username col-md-8">'+ selectedVideo.parentNode.parentNode.childNodes[1].childNodes[0].outerText +'</div>'+
								'<div class="control-fullscreen col-md-4"><img class="pull-right" data-id="'+ selectedVideo.id +'" src="images/icons/full-screen-white.png" /></div>'+
							'</div>'+
						'</div>';

	$('#video-focus').html(selectedMediaElement);
	document.getElementsByClassName(selectedVideo.id)[0].appendChild(selectedVideo);
	document.getElementById(selectedVideo.id).play();
	e.preventDefault();
	
	// update owl-carousel
	$(".owl-carousel").trigger('remove.owl.carousel', [indexToRemove]).trigger('refresh.owl.carousel');
	if(focusVideo){
		$('#joined-video-container').trigger('add.owl.carousel', [focusMediaElement]).trigger('refresh.owl.carousel');
		document.getElementsByClassName(focusVideo.id)[0].appendChild(focusVideo);
		document.getElementById(focusVideo.id).play();
	}
});

// when dbl click video, full screen
$(document).on('dblclick', 'video', function(e){
	goFullscreen(this.id);
});

// when click video item, full screen
$(document).on('click', '.control-fullscreen img', function(){
	goFullscreen($(this).attr('data-id'));
});

// toggle full screen function
function goFullscreen(id) {
  var element = document.getElementById(id);       
  if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen();
  }  
}

// ==================================== //
// Text Message Chat Part
// ==================================== //
// FileSharing/TextChat Code
$(document).on('keyup', '#input-text-chat', function(e){
	if(e.keyCode != 13) return;
    sendMsg();
});

// send chat message when click send button
$(document).on('click', '#btn-send-chat', function(e){
	sendMsg();
});

// function for sending message
function sendMsg(){
	var chat_input = $('#input-text-chat');
    if (!chat_input.val()) return;
	connection.send(chat_input.val());
    appendMsg(chat_input.val());
    chat_input.val('');
}

// share file in chat box
$(document).on('click','#share-file',function(){
	var fileSelector = new FileSelector();
    fileSelector.selectSingleFile(function(file) {
        connection.send(file);
    });
});

// ========================= //
// Web RTC connection part
// ========================= //
var connection = new RTCMultiConnection();
connection.socketURL = 'https://sleepy-tundra-93052.herokuapp.com/';
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

// set extra variable into socket's all stream
connection.extra = {
	username: document.getElementById('current_user').outerText,
	createdAt: (new Date).toLocaleDateString() + ' at ' + (new Date).toLocaleTimeString()
}

// when meeting room open, event processing
connection.onopen = function() {
    document.getElementById('share-file').disabled      = false;
    document.getElementById('input-text-chat').disabled = false;
};

// video stream processing
connection.onstream = function(event) {
	// Hide Loading / Logo Images
	$('#loading').addClass('hidden');
	$('#cover-img').addClass('hidden');
	// Add Video Stream into Video Container
	event.mediaElement.controls = false;
	var mediaElement = '<div class="media-element">'+
							'<div class="media-box '+ event.streamid +'"></div>'+
							'<div class="media-controls row">'+
								'<div class="media-username col-md-8 col-sm-8 col-xs-8">'+ event.extra.username +'</div>'+
								'<div class="control-fullscreen col-md-4 col-sm-4 col-xs-4"><img class="pull-right" data-id="'+ event.streamid +'" src="images/icons/full-screen-white.png" /></div>'+
							'</div>'+
						'</div>';

    if ($('#video-me video').length == 0) {
    	$('#video-me').append(mediaElement);
    	document.getElementsByClassName(event.streamid)[0].appendChild(event.mediaElement);
    } else if ($('#video-focus video').length == 0) {
		$('#video-focus').append(mediaElement);
    	document.getElementsByClassName(event.streamid)[0].appendChild(event.mediaElement);
    } else {
		if(document.getElementById(event.streamid)) {
	        var existing = document.getElementById(event.streamid);
	        existing.parentNode.parentNode.parentNode.parentNode.removeChild(existing);
	    }
    	$('#joined-video-container').trigger('add.owl.carousel', [mediaElement]).trigger('refresh.owl.carousel');
    	document.getElementsByClassName(event.streamid)[0].appendChild(event.mediaElement);
    	if (document.getElementsByClassName(event.streamid)[0].childNodes.length > 1) {

    	}
    }
};

// when video stream ended, processing
connection.onstreamended = function(event) {
    if (document.getElementById(event.streamid).parentNode.parentNode.parentNode.id == 'video-focus') {
    	$('#video-focus .media-element').remove();
    } else {
    	document.getElementById(event.streamid).parentNode.parentNode.parentNode.className = 'owl-item ended';
    	var endedIndex = $('.owl-item.ended').index();
    	$(".owl-carousel").trigger('remove.owl.carousel', [endedIndex]).trigger('refresh.owl.carousel');
    }
};

// get screen constraints for screen share
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

// chat file processing
connection.filesContainer = document.getElementById('file-container');


// chat message processing
connection.onmessage = appendMsg;

// show in & out message in chat
var chatContainer = document.querySelector('.chat-output');
function appendMsg(event) {
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

// onmute processing
connection.onmute = function(e) {
    if (!e.mediaElement) {
        return;
    }

    if (e.muteType === 'both' || e.muteType === 'video') {
        e.mediaElement.src = null;
        e.mediaElement.pause();
        e.mediaElement.poster = e.snapshot || '/images/poster.png';
    } else if (e.muteType === 'audio') {
        e.mediaElement.muted = true;
    }
};

// onunmute processing
connection.onunmute = function(e) {
    if (!e.mediaElement) {
        return;
    }

    if (e.unmuteType === 'both' || e.unmuteType === 'video') {
        e.mediaElement.poster = null;
        e.mediaElement.src = URL.createObjectURL(e.stream);
        e.mediaElement.play();
    } else if (e.unmuteType === 'audio') {
        e.mediaElement.muted = false;
    }
};