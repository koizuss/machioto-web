package controllers;

import play.*;
import play.mvc.*;

import java.util.*;

import models.*;

public class Entry extends Controller {
	
	private static final Float RANGE = 0.00277778F;
	
	public static void index(Float latitude, Float longitude){
		Float latitudeMax = latitude + RANGE;
		Float latitudeMin = latitude - RANGE;
		Float longitudeMax = longitude + RANGE;
		Float longitudeMin = longitude - RANGE;
		
		List<models.Entry> results = new ArrayList<models.Entry>();
		for (models.Entry entry : models.Entry.all().order("-modified").fetch()) {
			if(entry.latitude != null
				&& entry.longitude != null
				&& entry.latitude < latitudeMax
				&& entry.latitude > latitudeMin
				&& entry.longitude < longitudeMax
				&& entry.longitude > longitudeMin){
				results.add(entry);
			}
		}
		// TODO: motto iihouhou naino??
		
		renderJSON(results);
	}
	
	public static void put(models.Entry entry) {
		Date now = new Date();
		entry.created = now;
		entry.modified = now;
		entry.save();
		index(entry.latitude, entry.longitude);
    }
	
	public static void all(){
		renderJSON(models.Entry.all().fetch());
	}
}