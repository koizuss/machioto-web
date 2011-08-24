var gps = navigator.geolocation;
var geocoder;

$(function(){
	var searchResult = $('#search-result');
	var auto = $('#auto');
	var edit = $('#edit');
	var results = $('#results');
	var timeout = 3000;
	var dialog = $('#dialog');
	// var timer = 0;
	
	var showDialog = function(message){
		dialog
			.find('p').text(message)
			.dialog('open');
	}
	
	var updatePlaceName = function(){
		var place = $('input[name=place]:checked');
		if(place.length != 1){
			$('#place-name').text('please set');
			$('#place-name').addClass('error');
			/*
			clearInterval(timer);
			timer = 0;
			// alert('clear timer');
			*/
		}else{
			$('#place-name').text(place.val());
			$('#place-name').removeClass('error');
			/*
			if(!timer){
				timer = setInterval(function(){
					getPosition(fetchEntries);
				}, 10000);
				// alert('set timer');
			}
			*/
		}
	}
	
	var toggleSerchPlaceForm = function(){
		if(edit.hasClass('show')){
			$('#place-form .inner').hide();
			edit
				.removeClass('show')
				.text('edit');
		}else{
			$('#place-form .inner').show();
			edit
				.addClass('show')
				.text('ok');
		}
	}
	
	var showSerchPlaceForm = function(){
		if(!edit.hasClass('show')){
			toggleSerchPlaceForm();
		}
	}
	
	var getPosition = function(callback){
		var place = $('input[name=place]:checked');
		if(place.length != 1){
			return;
		}
		
		if(auto.attr('checked')){
			gps.getCurrentPosition(
					function(position){
						callback(position.coords.latitude,
								position.coords.longitude);
					},
					function(error){
						// alert('code: ' + error.code + ', message: ' + error.message);
						showDialog("Can't get your place. Please set other place.");
						auto.removeAttr('checked');
						updatePlaceName();
						showSerchPlaceForm();
					},
					{timeout: timeout});
					// TODO: errorCallback
		}else{
			callback(place.nextAll('[name=latitude]').val(),
					place.nextAll('[name=longitude]').val());
		}
	};
	
	var updateEntries = function(entries){
		results.find('div.box').remove();
		$(entries).each(function(){
			$('<div></div>')
				.addClass('box')
				.addClass('entry')
				.attr('id', this.id)
				.append(
					$('<a></a>')
						.attr('href', 'http://www.youtube.com/watch?v=' + this.youtubeId)
						.attr('title', '')
						.append(
							$('<img />')
								.attr('src', 'http://i.ytimg.com/vi/' + this.youtubeId + '/0.jpg')
								.attr('alt', this.title)
								.attr('height', 90)
								.attr('width', 120)
							)
						.prettyPhoto({theme: 'dark_rounded'})
						)
				.append(
					$('<div></div>')
						.addClass('entry-summary')
						.append($('<h2></h2>').text(this.title))
						.append($('<p></p>').text('latitude: ' + this.latitude +  ', longitude: ' + this.longitude))
						)
				.appendTo(results);
		});
	};
	
	// TODO: refactering ajax
	var putEntry = function(latitude, longitude){

		var youtubeId = $('#url').val().replace(/.*v=([^\&]+)&?.*/, '$1');
		// alert(youtubeId);
		$.ajax({
			type: 'GET',
			url: 'http://gdata.youtube.com/feeds/api/videos/' + youtubeId,
			dataType: 'json',
			data: {alt: 'json'},
			success: function(result){
				var data = {
	 				'entry.youtubeId': youtubeId,
	 				'entry.title': result.entry.title.$t,
	 				'entry.latitude': latitude,
	 				'entry.longitude': longitude
	 			};
				
				// TODO: callback function
				$.ajax({
					type: 'POST',
					url: '/entry/put',
					dataType: 'json',
					data: data,
					success: function(results){ updateEntries(results) },
					error: function(obj, status, msg){
						// alert('/entry/put;' + status + ': ' + msg);
						showDialog("put entry failed.");
					},
					timeout: timeout
				});
			},
			error: function(obj, status, msg){
				// alert('http://gdata.youtube.com/feeds/api/videos/;' + status + ': ' + msg);
				showDialog("Can't get Youtube data.");
				},
			timeout: timeout
		});
	};
	
	var fetchEntries = function(latitude, longitude){
		var data = {
			latitude: latitude,
			longitude: longitude
		};
		
		// TODO: callback function
		$.ajax({
			type: 'POST',
			url: '/entry/index',
			dataType: 'json',
			data: data,
			success: function(results){ updateEntries(results) },
			error: function(obj, status, msg){
				// alert(status + ': ' + msg);
				showDialog("Can't get entries.");
				},
			timeout: timeout
		});
	}
	
	if(gps){
		auto.attr('checked', 'checked');
		updatePlaceName();
		getPosition(fetchEntries);
	}else{
		auto.parent().remove();
		showSerchPlaceForm();
	}
	
	auto.change(function(){
		if(this.checked){
			updatePlaceName();
		}
	});
	
	edit.click(function(){
		toggleSerchPlaceForm();
	});
	
	$('#search').click(function(){
		// alert(google);
		
		if(!google.maps){
			// alert('google maps load failed');
			return;
		}
		
		if(!geocoder){
			geocoder = new google.maps.Geocoder();
		}
		
		// alert(geocoder);
		// TODO: timeout??
		geocoder.geocode( { address: $('#address').val() }, function(results, status) {
			searchResult.find('dd').remove();
			if(status == google.maps.GeocoderStatus.OK){
				// alert('SUCCESS: ' + status);
				$(results).each(function(){
					$('<dd></dd>')
						.append(
								$('<input type="radio" name="place" />')
									.val(this.formatted_address)
									.change(function(){
										if(this.checked){
											updatePlaceName();
										}
									})
									)
						.append($('<lavel></lavel>').text(this.formatted_address))
						.append($('<input type="hidden" name="latitude" />').val(this.geometry.location.lat()))
						.append($('<input type="hidden" name="longitude" />').val(this.geometry.location.lng()))
						.appendTo(searchResult);
					
					searchResult.find('dd:first input:radio').attr('checked', 'checked');
					updatePlaceName();
					getPosition(fetchEntries);
				});
			}else{
				// alert('ERROR: ' + status);
				showDialog('Can not search place this address.');
			}
		});
	});
	
	$('#put-entry').click(function(){
		// TODO: validation
		getPosition(putEntry);
	});
	
	$('#update').click(function(){
		getPosition(fetchEntries);
	});
	
	$('#update').button();
	dialog
		.dialog('destroy')
		.dialog({modal: true, autoOpen: false});
});