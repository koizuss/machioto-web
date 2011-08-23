var gps = navigator.geolocation;
var geocoder;

$(function(){
	var searchResult = $('#search-result');
	var auto = $('#auto');
	var results = $('#results');
	var timeout = 10000
	
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
						alert('code: ' + error.code + ', message: ' + error.message);
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
				.append($('<h2></h2>').text(this.title))
				.append($('<p></p>').text('latitude: ' + this.latitude +  ', longitude: ' + this.longitude))
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
						
				.appendTo(results);
		});
	};
	
	// TODO: refactering ajax
	var putEntry = function(latitude, longitude){

		var youtubeId = $('#url').val().replace(/.*v=([^\&]+)&?.*/, '$1');
		alert(youtubeId);
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
					error: function(obj, status, msg){ alert('/entry/put;' + status + ': ' + msg); },
					timeout: timeout
				});
			},
			error: function(obj, status, msg){ alert('http://gdata.youtube.com/feeds/api/videos/;' + status + ': ' + msg); },
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
			error: function(obj, status, msg){ alert(status + ': ' + msg); },
			timeout: timeout
		});
	}
	
	if(gps){
		auto.attr('checked', 'checked');
	}else{
		auto.parent().remove();	
	}
	
	$('#search').click(function(){
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
						.append($('<input type="radio" name="place" />').val(this.formatted_address))
						.append($('<lavel></lavel>').text(this.formatted_address))
						.append($('<input type="hidden" name="latitude" />').val(this.geometry.location.lat()))
						.append($('<input type="hidden" name="longitude" />').val(this.geometry.location.lng()))
						.appendTo(searchResult);
					
					searchResult.find('dd:first input:radio').attr('checked', 'checked');
					getPosition(fetchEntries);
				});
			}else{
				// alert('ERROR: ' + status);
				alert('Can not search place this address');
			}
		});
	});
	
	$('#put-entry').click(function(){
		// TODO: validation
		getPosition(putEntry);
	});
	
	$('#update-entries').click(function(){
		// TODO: validation
		getPosition(fetchEntries);
	});
});