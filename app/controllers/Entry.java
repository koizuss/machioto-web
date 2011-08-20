package controllers;

import play.*;
import play.mvc.*;

import java.util.*;

import models.*;

public class Entry extends Controller {
	public static void put(String url, Float latitude, Float longitude) {
		Logger.debug("url: %s, latitude: %s, latitude: %s", url, latitude, longitude);
		
		new models.Entry(url, latitude, longitude).save();
		Logger.debug("save successful");
		
		renderJSON(models.Entry.queryAll());
    }
}