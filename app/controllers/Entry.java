package controllers;

import play.*;
import play.mvc.*;

import java.util.*;

import models.*;

public class Entry extends Controller {
	public static void put(String url, Long latitude, Long longitude) {
    	new models.Entry(url, latitude, longitude).save();
    	renderJSON(models.Entry.queryAll());
    }
}