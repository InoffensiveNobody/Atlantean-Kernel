import express from 'express';

import puppeteer from "puppeteer";

import dotenv from "dotenv"

dotenv.config();

const app = express();

const port = process.env.PORT || 8080;
import http from 'https';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

import bcrypt from 'bcrypt'
/*
import expressSession from "express-session";

import passport from "passport"

import {Strategy as LocalStrategy} from "passport-local"

passport.serializeUser((user,cb) => { 

    return cb(null, user.uuid)

} )

*/
/*
import {TwitterApi as TwitterApi} from 'twitter-api-v2';
*/
/*
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET_KEY,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function postTweet(status) {
  try {
    const response = await client.v2.tweet(status.substring(0, 280));
    console.log('Tweet posted successfully:', response.data);
  } catch (error) {
    console.error('Error posting tweet:', error);
  }
}*/

import util from "util"

import { 
  v1 as uuidv1
} from 'uuid';

import neo4j from 'neo4j-driver'

import he from "he";

import {uri, user, key, password, SESSION_SECRET, redis_password} from './config.js'
import mermaid from "./js/mermaid.js"

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password))

import path from 'path';

import bodyParser from 'body-parser'

app.use( bodyParser.json({limit : "50mb"}) );       
app.use(bodyParser.urlencoded({     
  extended: true
})); 

app.use(express.static(path.join(__dirname, 'static')));

var google_web_search = function(search, callback) {
    console.log('Searching the web for: ', search);
    var options = {
        method: 'GET',
        url: 'https://www.googleapis.com/customsearch/v1',
        qs: {
            q: search,
            key: 'your-key',
            cx: 'f73e8c767efda439d',
        }
    };

    request(options, function (error, response, body) {
        callback(error, body);
    });
};


import { check, validationResult } from 'express-validator';



var stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']

function remove_stopwords(str) {
    var res = []
    var str = str.toLowerCase();
    var words = str.split(' ')
    for(var i=0;i<words.length;i++) {
       var word_clean = words[i].split(".").join("")
       if(!stopwords.includes(word_clean)) {
           res.push(word_clean)
       }
    }
    return(res.join(' '))
}

var public_buoys = getPublicBuoys();

function getPublicBuoys(){
  var session = driver.session();
  var query = "MATCH (h:Buoy {private : false}) " +
  "RETURN h"
  var params = {}
  session.run(query,params).then(data=>{
    session.close();
    return data.records.map(buoy => buoy._fields[0].properties.uuid);
  })
}

const amazonIsbnSearchUrl = (isbn, author) =>
"https://www.amazon.com/s?i=stripbooks&rh=p_27%3A" + author + " %2Cp_28%3A" + isbn + "&s=relevanceexprank&Adv-Srch-Books-Submit.x=31&Adv-Srch-Books-Submit.y=16&unfiltered=1&ref=sr_adv_b"

function parseSrcset(srcset) {
  if (!srcset) return null;
  return srcset
    .split(", ")
    .map((d) => d.split(" "))
    .reduce((p, c) => {
      if (c.length !== 2) {

        return;
      }
      p[c[1]] = c[0];
      return p;
    }, {});
}

async function scrape(isbn, author, options = {}) {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 800, height: 600, deviceScaleFactor: 3 },
    args : ['--no-sandbox', '--disable-setuid-sandbox'],
    ...options
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false)
  await page.goto(amazonIsbnSearchUrl(isbn, author));
  const images = await page.$$(".s-image");
  const srcsets = [];
  if (images.length > 0) {
    for (let image of images) {
      const element = await image.asElement();
      const propertyHandle = await element.getProperty("srcset");
      const propertyValue = await propertyHandle.jsonValue();
      if(propertyValue){
        srcsets.push(propertyValue);

      }
    }
  }
  await browser.close();
  const thumbs = srcsets.map(parseSrcset).filter((a) => !!a);
  return thumbs.length > 0 ? thumbs[0] : null;
}

let previousRequest = Promise.resolve();

async function get(isbn, author, options = {}) {

  const executeFetch = () => {
    return scrape(isbn, author, options)
      .then((data) => {
        return data;
      })
      .catch((e) => {
        throw e;
      });
  };
  previousRequest = previousRequest.then(executeFetch, executeFetch);
  const data = await previousRequest;

  var session = driver.session();
  var query = "MATCH (s:Source {title:$title}) " +
    "SET s.imgSrc = $cover"
  var params = {cover: data ? data["1x"] : "", title: isbn}
  session.run(query,params).then(data=>{
    session.close();
  })
  return data;
}

async function open(title, author){

  const browser = await puppeteer.launch({
    defaultViewport: { width: 800, height: 600, deviceScaleFactor: 3 }
  });
  const srcsets = [];
  const page = await browser.newPage();
  await page.setCacheEnabled(false)
  await page.goto("https://openlibrary.org/search?title=" + title + "&author=" + author);
  const imgs = await page.$$eval('.bookcover a img', imgs => imgs.map(img => img.getAttribute('src')));

    if(imgs[0]){
      imgs[0] = imgs[0].substring(2);
      imgs[0] = "http://www." + imgs[0];
      var session = driver.session();
      var query = "MATCH (s:Source {title:$title}) " +
        "SET s.imgSrc = $cover"
      var params = {cover: imgs[0], title: title} 
      session.run(query,params).then(data=>{
        console.log(title, imgs[0])
        session.close();
        return imgs[0];
      })
    }    

}

function isKing(req,res,next){
  var query = "MATCH (u:User {uuid : $uuid})-[a:ACCESS]->(b:Buoy{uuid : 'd2b358ee-b58d-11ed-afa1-0242ac120002'}) " +
  "RETURN a.rankTitle "
  var params = {uuid : req.user.uuid};
  var session = driver.session();
  session.run(query,params).then(data=>{
    session.close();
    if(data.records && data.records.length > 0 && data.records[0]._fields[0] === "Philosopher King"){
      console.log("PHILOSOPHER KING CHECKING INVITES")
      return next();
    }
    else{
      console.log("NO KING!")
      return res.json({errors : [{msg : "401"}]})
    }
  })
}

app.get("/source_cover/:title", check("title").trim().escape().not().isEmpty(), check("author").trim().escape(), async function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

       var cover = await get(req.params.title, req.query.author)["1x"];

    res.json({cover : cover})

})

app.post("/google_img/:uuid", check("uuid").trim().escape().not().isEmpty(), check("img").trim().escape().not().isEmpty(), function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
  var query = "MATCH (s:Source {uuid : $uuid}) " +
  "SET s.imgSrc = $img"
  var params = {img : req.body.img, uuid : req.params.uuid}
  var session = driver.session();
  session.run(query,params).then(data=>{
    session.close();
    return res.end();
  })
})

app.post("/recommend/:switch", check("recPrevUUIDs").not().isEmpty(), check("switch").not().isEmpty().trim().escape(), check("publisher").trim().escape(), check("uuid").trim().escape(), function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    switch(req.params.switch){
      case "source" : 
        var recPrevUUIDs = JSON.parse(req.query.recPrevUUIDs);
        mermaid.recommendSource(driver, req.query.uuid, recPrevUUIDs, function(data){
          quantumMermaid(data.records.length, function(index){

            console.log("INDEX : " + index + "LEN : " + data.records.length);
            if(data.records[0]){
              console.log(util.inspect(data.records))
              console.log(data.records[index]._fields[0].properties.uuid)
              return res.json({source : data.records[index]._fields[0].properties.uuid })
            }
            else{
              return res.json({errors : [{msg : ""}]})
            }
          })
          
        })
      break;
    }
})

function quantumMermaid(len, cb){
  var options = {
      host: 'lfdr.de',
      path: '/qrng_api/qrng?length=1&format=HEX'
  };
  var qrn = null;
  var req = http.get(options, function (res) {

    var bodyChunks = [];
    res.on('data', function(chunk) {
      // You can process streamed parts here...
      bodyChunks.push(chunk);
    })

    res.on('end', function() {
      var body = Buffer.concat(bodyChunks);

      
      console.log('BODY: ' + body);
        var json = JSON.parse(body)
        try{
          qrn = json.qrn;
        }
        catch(error){
          var min = Math.ceil(0);
          var max = Math.floor(172);
          qrn = Math.floor(Math.random() * (max - min + 1)) + min;
        }
     
      
      cb(hexMermaid(qrn, len))

      // ...and/or process the entire body here.
    })

  });

  req.setTimeout(3000, () => {
      // 2. The timeout callback is triggered on idle socket activity
      req.abort(); // Crucially, abort the request 
      
      // You would typically call a callback or reject a promise here
    });

    req.on('error', (err) => {
      var min = Math.ceil(0);
      var max = Math.floor(172);
      qrn = Math.floor(Math.random() * (max - min + 1)) + min;
      cb(hexMermaid(qrn, len))
      console.error(`Request timed out.`);
    });
}
function hexMermaid(hexString, len){
  // Step 2: Convert the hexadecimal string to a decimal number (N)
// The parseInt() function with radix 16 does this conversion.
  console.log(hexString);
  const decimalValue = parseInt(hexString, 16); 
  // In this example: decimalValue is 65453
  console.log(decimalValue)
  // Step 3: Apply the modulo operator to constrain the range to 0-172
  const remainder = decimalValue % (len > 173 ? 172 : len); 
  // 65453 / 173 = 378 with a remainder of 159.
  // remainder is 159
  return remainder;

}


app.post("/edit_select", check("media").not().isEmpty().trim().escape(), 
  check("formats").not().isEmpty().trim().escape(), check("types").not().isEmpty().trim().escape(), function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session()

    var types = JSON.parse(he.decode(req.body.types));
    for (var i = 0; i < types.length; i++) {
     types[i] = he.encode(types[i].trim())
    }

    var media = JSON.parse(he.decode(req.body.media));
    for (var i = 0; i < media.length; i++) {
     media[i] = he.encode(media[i].trim())
    }

    var formats = JSON.parse(he.decode(req.body.formats));
    for (var i = 0; i < formats.length; i++) {
     formats[i] = he.encode(formats[i].trim())
    }

    var params = {types : types, media: media, formats : formats};
    var query = "MATCH (b:Buoy {uuid: 'd2b358ee-b58d-11ed-afa1-0242ac120002'}) " +
    "SET b.types = $types, b.media = $media, b.formats = $formats"

    session.run(query, params).then(data => {
      session.close();
      return res.end();
    })
  })

app.post("/torrents/adv_search", check("class_all").trim().escape().isLength({max:100}), check("title").trim().escape().isLength({max: 400}),
 check("author").trim().escape().isLength({max: 200}), check("classes").trim().escape().isLength({max:1251}).toLowerCase(),
  check("publisher").trim().escape().isLength({max: 612}), check("type").trim().escape().isLength({max:200}), check("media").trim().escape().isLength({max:350}),
  check("format").trim().escape().isLength({max:360}), function(req,res){
    console.log("HERE!!!!", validationResult(req))
    const errors = validationResult(req);
    console.log(errors);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    req.body.title = remove_stopwords(req.body.title);

    const session = driver.session();
    var query = ""
    if(req.body.classes){
      var classes = JSON.parse(he.decode(req.body.classes)).split(",");
      if(classes[0] === ['']){
        classes = []
      }
      else{
        for (var i = 0; i < classes.length; i++) {
         classes[i] = he.decode(classes[i].trim()).replace(/['"]+/g, '')
        }  
      }
    }
    req.body.title = req.body.title.replace(":", ' ')
    req.body.author = req.body.author.replace(":", ' ')
    req.body.publisher = req.body.publisher.replace(':', ' ')
    if(req.body.title && req.body.type === "all"){
      console.log("THERE!!!")
      query += "CALL db.index.fulltext.queryNodes('titles', $title) YIELD node " +
      "MATCH (s:Source) WHERE s.uuid = node.uuid "
    }
    else if(req.body.title && req.body.type !== "all"){
      query += "CALL db.index.fulltext.queryNodes('titles', $title) YIELD node " +
      "MATCH (s:Source {type : $type}) WHERE s.uuid = node.uuid "
    }
    else if(!req.body.title && req.body.type !== "all"){
      query += "MATCH (s:Source {type : $type}) "
    }
    else if(req.body.classes && req.body.classes !== "undefined"){
      query += "MATCH (s:Source)<-[:TAGS]-(c:Class) WHERE c.name IN $classes "
    }
    else{
      query += "MATCH (s:Source) "
    }   
    query += "WITH s " 
    if(req.body.author){
      query += "CALL db.index.fulltext.queryNodes('authorSearch', $author) YIELD node " +
      "MATCH (a1:Author)-[:AUTHOR]->(s) WHERE a1.uuid = node.uuid " + 
      "OPTIONAL MATCH (a:Author)-[:AUTHOR]->(s) "
    }
    else{
      query += "OPTIONAL MATCH (a:Author)-[]->(s) "
    }
    query += "WITH s, a "
    if(req.body.publisher){
      query += "CALL db.index.fulltext.queryNodes('publisher', $publisher) YIELD node " +
        "MATCH (e:Edition)-[]-(s) WHERE e.publisher = node.publisher "
      }
    else{
      query += "OPTIONAL MATCH (e:Edition)<-[:PUB_AS]-(s) " 

    }
  query += "WITH s,a,e "
  if(req.body.media !== "all" && req.body.format !== "all"){
    query += "MATCH (t:Torrent {media: $media, format:$format})<-[:DIST_AS]-(e)-[]-(s) WHERE t.deleted = false " 

  }
  else if(req.body.media !== "all"){
    query += "MATCH (t:Torrent {media: $media})<-[:DIST_AS]-(e)-[]-(s) WHERE t.deleted = false " 

  }
  else if(req.body.format !== "all"){
    query += "MATCH (t:Torrent {format:$format})<-[:DIST_AS]-(e)-[]-(s) WHERE t.deleted = false " 

  }
  else{
    query += "OPTIONAL MATCH (t:Torrent)<-[:DIST_AS]-(e)-[]-(s) WHERE t.deleted = false " 

  }
  query+= "WITH s " 
  if(req.body.classes){
    
    console.log(req.body.class_all)
    if(req.body.class_all === "true"){
      query += "MATCH (c:Class)-[:TAGS]->(s) " +
      "WITH s " +
      "MATCH (c1:Class) WHERE c1.name IN $classes "+ 
      "WITH s, collect(c1) as classes " +
      "WITH s, head(classes) as head, tail(classes) as classes " +
      "MATCH (head)-[:TAGS]->(s) " +
      "WHERE ALL(c1 in classes WHERE (c1)-[:TAGS]->(s)) "
      
    }
    else{
      query += "MATCH (c:Class)-[:TAGS]->(s) " + 
      "WITH s " +
      "MATCH (c1:Class)-[:TAGS]->(s) WHERE c1.name IN $classes "
    }

    query += "WITH count(DISTINCT s) AS count "

  }
  else{
    query += "WITH count(DISTINCT s) AS count "

  }
  if(req.body.title && req.body.type === "all"){
      console.log("THERE!!!")
      query += "CALL db.index.fulltext.queryNodes('titles', $title) YIELD node " +
      "MATCH (s:Source) WHERE s.uuid = node.uuid "
    }
    else if(req.body.title && req.body.type !== "all"){
      query += "CALL db.index.fulltext.queryNodes('titles', $title) YIELD node " +
      "MATCH (s:Source {type : $type}) WHERE s.uuid = node.uuid "
    }
    else if(!req.body.title && req.body.type !== "all"){
      query += "MATCH (s:Source {type : $type}) "
    }
    else{
      query += "MATCH (s:Source) "
    }
    query += "WITH s, count " 
    if(req.body.author){
      query += "CALL db.index.fulltext.queryNodes('authorSearch', $author) YIELD node " +
      "MATCH (a1:Author)-[:AUTHOR]->(s) WHERE a1.uuid = node.uuid " + 
      "OPTIONAL MATCH (a:Author)-[:AUTHOR]->(s) "
    }
    else{
      query += "OPTIONAL MATCH (a:Author)-[]->(s) "
    }
    query += "WITH s, a, count "
    if(req.body.publisher){
      query += "CALL db.index.fulltext.queryNodes('publisher', $publisher) YIELD node " +
        "MATCH (e:Edition)-[]-(s) WHERE e.publisher = node.publisher "
      }
    else{
      query += "OPTIONAL MATCH (e:Edition)<-[:PUB_AS]-(s) " 

    }
  query += "WITH s,a,e, count "
  if(req.body.media !== "all" && req.body.format !== "all"){
    query += "MATCH (t:Torrent {media: $media, format:$format})<-[:DIST_AS]-(e)-[]-(s) WHERE t.deleted = false " 

  }
  else if(req.body.media !== "all"){
    query += "MATCH (t:Torrent {media: $media})<-[:DIST_AS]-(e)-[]-(s) WHERE t.deleted = false " 

  }
  else if(req.body.format !== "all"){
    query += "MATCH (t:Torrent {format:$format})<-[:DIST_AS]-(e)-[]-(s) WHERE t.deleted = false " 

  }
  else{
    query += "OPTIONAL MATCH (t:Torrent)<-[:DIST_AS]-(e)-[]-(s) WHERE t.deleted = false " 

  }
  query+= "WITH s,a,e,t, {total_size_bytes : t.total_size_bytes, USD_price : t.USD_price, copyrighted : t.copyrighted, payWhatYouWant : t.payWhatYouWant, " +
  "payment : t.payment, uuid : t.uuid, ETH_address: t.ETH_address, format : t.format ,media: t.media, uploaderUUID : t.uploaderUUID, "  +
    "uploaderUser : t.uploaderUser, snatches: t.snatches, created_at : t.created_at, infoHash: t.infoHash, numPeers:  t.numPeers} AS torrent, count " 
  if(req.body.classes){
    var classes = JSON.parse(he.decode(req.body.classes)).split(",");
    if(classes[0] === ['']){
      classes = []
    }
    else{
      for (var i = 0; i < classes.length; i++) {
       classes[i] = he.decode(classes[i].trim()).replace(/['"]+/g, '')
      }  
    }
    console.log(req.body.class_all)
    if(req.body.class_all === "true"){
      query += "MATCH (c:Class)-[:TAGS]->(s) " +
      "WITH s,a,e,t,c,torrent, count " +
      "MATCH (c1:Class) WHERE c1.name IN $classes "+ 
      "WITH s,a,e,t,c,torrent, collect(c1) as classes, count " +
      "WITH s,a,e,t,c,torrent,head(classes) as head, tail(classes) as classes, count " +
      "MATCH (head)-[:TAGS]->(s) " +
      "WHERE ALL(c1 in classes WHERE (c1)-[:TAGS]->(s)) "
    }
    else{
      query += "MATCH (c:Class)-[:TAGS]->(s) " + 
      "WITH s,a,e,t,c,torrent, count " +
      "MATCH (c1:Class)-[:TAGS]->(s) WHERE c1.name IN $classes "
    }

    query += "WITH s, collect(DISTINCT a) AS authors, collect(DISTINCT{edition : e, torrent: torrent} ) AS edition_torrents, c, count "

  }
  else{
    query += "OPTIONAL MATCH (c:Class)-[:TAGS]->(s) " 

    query += "WITH s, collect(DISTINCT a) AS authors, collect(DISTINCT{edition : e, torrent: torrent} ) AS edition_torrents, c, count "

  }
  query += "WITH s, authors, edition_torrents, collect(DISTINCT c) AS classes, count "
  

  

  switch(req.body.order[0].column){
    case '0':
      query += "RETURN s, authors, edition_torrents, classes, count ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;
    case '1':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, authors, edition_torrents, classes, count ORDER BY s.title ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, authors, edition_torrents, classes, count ORDER BY s.title DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      break;
    case '2':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, authors, edition_torrents, classes, count ORDER BY s.numPeers ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, authors, edition_torrents, classes, count ORDER BY s.numPeers DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '3':
      console.log("SNATCHES SORT")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, authors, edition_torrents, classes, count ORDER BY s.snatches ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, authors, edition_torrents, classes, count ORDER BY s.snatches DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '4':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, authors, edition_torrents, classes,  ORDER BY s.updated ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, authors, edition_torrents, classes, count ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    default :
      query += "RETURN s, authors, edition_torrents, classes, count ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;

  }
  console.log(query);
  var params = {skip : req.body.start, limit : req.body.length, title : he.encode(he.decode(he.decode(req.body.title))), author : he.encode(he.decode(he.decode(req.body.author))), 
  classes: classes, publisher : he.encode(he.decode(he.decode(req.body.publisher))), type : he.encode(he.decode(he.decode(req.body.type))), media: req.body.media, format : req.body.format}
  console.log(params.classes)
  console.log(req.body.type)
  console.log(he.encode(he.decode(he.decode(he.decode(req.body.type)))))
  session.run(query , params).then(data => {
      session.close()      
      var recordsTotal;
      var recordsFiltered;
      console.log(util.inspect(data.records[0]))
      if(data.records.length > 0){
        recordsTotal = parseInt(data.records[0]._fields[4]);
        recordsFiltered = parseInt(data.records[0]._fields[4])
        console.log("TOTAL: " + recordsTotal)
        
      }
      return res.json({recordsTotal: recordsTotal, recordsFiltered: recordsFiltered, data: data.records});
    })
})

app.post("/graph_search", check("class_all").trim().escape().isLength({max:100}), check("title").trim().escape().isLength({max: 400}),
 check("author").trim().escape().isLength({max: 200}), check("classes").trim().escape().isLength({max:1251}).toLowerCase(),
  check("publisher").trim().escape().isLength({max: 612}), check("type").trim().escape().isLength({max:200}), check("media").trim().escape().isLength({max:350}),
  check("format").trim().escape().isLength({max:360}), function(req,res){
    console.log("HERE!!!!", validationResult(req))
    const errors = validationResult(req);
    console.log(errors);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    console.log("WELCOME TO GRAPH SEARCH")
    if(req.body.classes && req.body.classes !== "undefined"){
        var classes = JSON.parse(he.decode(req.body.classes)).split(",");
      if(classes[0] === ['']){
        classes = []
      }
      else{
        for (var i = 0; i < classes.length; i++) {
         classes[i] = he.decode(classes[i].trim()).replace(/['"]+/g, '')
        }  
      }
    }
    req.body.title = remove_stopwords(req.body.title);
    console.log("TITLE: " + req.body.title)
    const session = driver.session();
    var query = ""
    req.body.title = req.body.title.replace(":", ' ')
    req.body.author = req.body.author.replace(":", ' ')
    req.body.publisher = req.body.publisher.replace(':', ' ')
    if(req.body.title && req.body.title !== "undefined" && req.body.type === "all"){
      console.log("THERE!!!")
      query += "CALL db.index.fulltext.queryNodes('titles', $title) YIELD node " +
      "MATCH (s:Source) WHERE s.uuid = node.uuid "
    }
    else if(req.body.title && req.body.title !== "undefined" && req.body.type !== "all"){
      query += "CALL db.index.fulltext.queryNodes('titles', $title) YIELD node " +
      "MATCH (s:Source {type : $type}) WHERE s.uuid = node.uuid "
    }
    else if(!req.body.title && req.body.title !== "undefined" && req.body.type !== "all" && req.body.type){
      query += "MATCH (s:Source {type : $type}) "
    }
    //speeds up class_all
    else if(req.body.classes && req.body.classes !== "undefined"){

      query += "MATCH (s:Source)<-[:TAGS]-(c:Class) WHERE c.name IN $classes "
    }
    else{
      query += "MATCH (s:Source) "
    }   
    query += "WITH s "
    if(req.body.author && req.body.author !== "undefined"){
      query += "CALL db.index.fulltext.queryNodes('authorSearch', $author) YIELD node " +
      "MATCH (a1:Author)-[:AUTHOR]->(s:Source) WHERE a1.uuid = node.uuid " 
    }
    if(!req.body.title && req.body.title !== "undefined"){
      query += "WITH s "
    }
    
   if(req.body.media !== "all" && req.body.format !== "all" && req.body.media && req.body.format){
    query += "MATCH (x:Torrent {media: $media, format:$format})<-[:DIST_AS]-(e)-[]-(s) WHERE x.deleted = false " 

  }
  else if(req.body.media !== "all" && req.body.media){
    query += "MATCH (x:Torrent {media: $media})<-[:DIST_AS]-(e)-[]-(s) WHERE x.deleted = false " 

  }
  else if(req.body.format !== "all" && req.body.format){
    query += "MATCH (x:Torrent {format:$format})<-[:DIST_AS]-(e)-[]-(s) WHERE x.deleted = false " 

  }
  
   
    if(req.body.classes && req.body.classes !== "undefined"){
      

      console.log(req.body.class_all)
      if(req.body.class_all === "true"){
        query += "MATCH (c1:Class) WHERE c1.name IN $classes "+ 
        "WITH s,collect(c1) AS classes " +
        "WITH s,head(classes) as head, tail(classes) as classes " +
        "MATCH (head)-[:TAGS]->(s) " +
        "WHERE ALL(c1 in classes WHERE (c1)-[:TAGS]->(s)) "
      }      
      else{
        query += "MATCH (c1:Class)-[:TAGS]->(s) WHERE c1.name IN $classes "
      }

     

  }
  


  
    if(req.body.publisher && req.body.publisher !== "undefined"){
      query += "CALL db.index.fulltext.queryNodes('publisher', $publisher) YIELD node " +
        "MATCH (e:Edition)-[]-(s) WHERE e.publisher = node.publisher "
      }
    


   /*
   query += "OPTIONAL MATCH (a2)-[:AUTHOR]->(s) " 
  query += "OPTIONAL MATCH (s)<-[:TAGS]-(c2: Class) "
  query += "OPTIONAL MATCH (e2)<-[:PUB_AS]-(s) WHERE e2.publisher = 'foobar' "
  query += "WITH s,c2 AS classes,a2,e2,s AS sources,c2 "


  query += "RETURN s, classes, a2, e2, sources, c2 ORDER BY c2.snatches DESC LIMIT 1337 "*/
    
  
 /* query += "OPTIONAL MATCH (sa:Source)-[]-(a2:Author)-[:AUTHOR]->(s) " 
  query += "OPTIONAL MATCH (s)<-[:TAGS]-(c2: Class)-[:TAGS]->(sc:Source) "
  query += "OPTIONAL MATCH (sp)<-[:PUB_AS]-(e2:Edition)<-[:PUB_AS]-(s) WHERE e2.publisher <> '' "
 


  query += "RETURN s, a2, c2, e2, sa, sc, sp "*/
  

  query += "OPTIONAL MATCH (a2:Author)-[:AUTHOR]->(s) " 
  query += "OPTIONAL MATCH (s)<-[t:TAGS]-(c2:Class) "
  query += "OPTIONAL MATCH (e2:Edition)<-[:PUB_AS]-(s) WHERE e2.publisher <> '' "
 


  query += "RETURN s, a2, c2, e2, h ORDER BY s.snatches DESC LIMIT 1337 "

      console.log(query)
    
  var params = {skip : req.body.start, limit : req.body.length, title : he.encode(he.decode(he.decode(req.body.title))), author : he.encode(he.decode(he.decode(req.body.author))), 
  classes: classes, publisher : he.encode(he.decode(he.decode(req.body.publisher))), type : he.encode(he.decode(he.decode(req.body.type))), media: req.body.media, format : req.body.format}
  
  session.run(query , params).then(data => {
      session.close()      
      
      console.log(util.inspect(data.results))
      return res.json({data: data.records});
    })
})


app.get("/advanced_search_ui", function(req,res){
  const errors = validationResult(req);
    console.log(errors);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session()
    console.log("HERE!!!!!!!!!!!!!!!!!!!!!!!")
    var params = {}
    var query = "MATCH (b:Buoy {uuid : 'd2b358ee-b58d-11ed-afa1-0242ac120002'}) " + 
    "RETURN b"
    session.run(query,params).then(data=>{
      session.close();
      console.log(util.inspect(req.user))
      return res.json({buoy : data.records[0]._fields[0].properties, atlsd : req.user ? req.user.atlsd : ""})
    })
})

app.get("/upload_structure", function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()

  var params = {buoy : req.params.buoy}
  var query = "MATCH (b:Buoy {uuid : 'd2b358ee-b58d-11ed-afa1-0242ac120002'}) " + 
  "RETURN b"
  session.run(query,params).then(data=>{
    session.close();
    console.log(util.inspect(req.user))
    return res.json({buoy : data.records[0]._fields[0].properties, atlsd : req.user ? req.user.atlsd : ""})
  })
})

app.post("/bulletin", check("text").not().isEmpty().trim().escape(), check("title").not().isEmpty().trim().escape(),
  isAuthenticated, canBulletin, function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()

  var params = {buoy : req.params.buoy, title : req.body.title, text : req.body.text}

  var query = "MATCH (b:Buoy {uuid : 'd2b358ee-b58d-11ed-afa1-0242ac120002'}) " + 
  "SET b.bulletin_title = b.bulletin_title + $title " +
  "SET b.bulletin_text = b.bulletin_text  + $text"
  session.run(query,params).then(data=>{
    session.close();
    return res.end();
  })
})

app.post("/bulletin/node", check('text').trim().escape().not().isEmpty(), check('title').trim().escape().not().isEmpty(), isAuthenticated, canBulletin, function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()

  var params = {buoy : req.params.buoy, title : req.body.title, text : req.body.text, userName: req.user ? req.user.user : "Anonymous", userUUID : req.user ? req.user.uuid : "null"}

  var query = "MATCH (b:Buoy {uuid : 'd2b358ee-b58d-11ed-afa1-0242ac120002'}) " + 
  "MATCH (u:User {uuid : $userUUID}) " +
  "MERGE (u)-[:POSTED]->(bu:Bulletin {title : $title, text: $text, time: TOFLOAT(TIMESTAMP()), uuid: randomUUID(), userName : $userName, userUUID: $userUUID})<-[:HOME]-(b) "
  session.run(query,params).then(data=>{
    session.close();
    return res.end();
  })
})

function canBulletin(req,res,next){
  console.log(util.inspect(req.user))

 const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()
  var query = "MATCH (:User {uuid: $user})-[a:ACCESS]->(:Buoy{uuid:'d2b358ee-b58d-11ed-afa1-0242ac120002'}) " +
  "RETURN a.bulletin"
  var params = {user : req.user.uuid, buoy : req.body.buoy}
  session.run(query,params).then(data=>{
    session.close();
    if(data.records[0]){
      return next();
    }
    else{
      return res.json({errors : [{msg : "401"}]})
    }  
  })
}

app.get("/search", check("term").trim().escape(), check("field").not().isEmpty().trim().escape(), function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()

  console.log(req.query.field)

  req.query.term = remove_stopwords(req.query.term);
  if(req.query.term === "propagate" || req.query.term === "propagateinfo"){
    req.query.term = "propagate.info"
  }
  var query = "";  
  console.log("HERE");
  console.log(req.query.field)
  req.query.term = req.query.term.replace(":", '')
  console.log(req.query.term)
  if(req.query.term){
    switch(req.query.field){
      case "search_sources":
        query += "CALL db.index.fulltext.queryNodes('titles', $sourceName) YIELD node " +
        "MATCH (s:Source) WHERE s.uuid = node.uuid " +
        "RETURN s " 
        break;
      case "search_authors":
        query += "CALL db.index.fulltext.queryNodes('authorSearch', $authorName) YIELD node " +
        "MATCH (a:Author)-[:AUTHOR]->(s:Source) WHERE a.uuid = node.uuid " +
        "RETURN a "
        break;
      case "search_classes":
        query += "CALL db.index.fulltext.queryNodes('classes', $className) YIELD node " +
        "MATCH (c:Class) WHERE c.uuid = node.uuid " +
        "RETURN c " 
        break;
      case "search_publishers":
        query += "CALL db.index.fulltext.queryNodes('publisher', $publisherName) YIELD node " +
        "MATCH (e:Edition)-[]-(s:Source) WHERE e.uuid = node.uuid " +
        "RETURN e "
        break; 
    }
  }

  console.log(query);
  var params = {sourceName : req.query.term, authorName : req.query.term, className : req.query.term, publisherName: req.query.term};
  console.log(params);
  session.run(query , params).then(data => {
      session.close()
      var recordData = []
      if(data.records){
        data.records.forEach(function(data, i){
          if(recordData.find(n=>n.value === (req.query.field === "search_publishers" ? data._fields[0].properties.publisher : 
            data._fields[0].properties.uuid))){
            return;
          }
          switch(req.query.field){
            case "search_sources":
              recordData.push({label : data._fields[0].properties.title, value : data._fields[0].properties.uuid});
              console.log(recordData[0])
              break;
            case "search_authors":
              recordData.push({label : data._fields[0].properties.author, value : data._fields[0].properties.uuid});
              break;
            case "search_classes":
              recordData.push({label : data._fields[0].properties.name, value : data._fields[0].properties.uuid});
              break;
            case "search_publishers":
              recordData.push({label : data._fields[0].properties.publisher, value : data._fields[0].properties.publisher});
              break;
            default: 
              break;
          }
        }) 
        console.log(recordData);
        return res.send(recordData); 
      }
      else{
        return res.end();
    }
  }).catch(function(err){
    console.log(err);
    return res.end();
  })
  

  
})



 app.get("/infoHash/:uuid", check("uuid").not().isEmpty(), function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  console.log(req.params.uuid);
  var query = "OPTIONAL MATCH (free:Torrent { uuid : $uuid} ) WHERE free.USD_price = 0.0 " +
  "OPTIONAL MATCH (prem:Torrent { uuid :$uuid})<-[:BOUGHT {confirmed : true}]-(u:User{uuid : $userUUID}) " +
  "OPTIONAL MATCH (free)<-[:UPLOADED]-(u:User) " +
  "RETURN free.infoHash, prem.infoHash, u.user"
  var params = {uuid: req.params.uuid, userUUID : req.user ? req.user.uuid : "null"}
  var session = driver.session();
  session.run(query,params).then(data=>{
    console.log('HERE' + data.records[0]);
    session.close();
    if(data.records[0] && (data.records[0]._fields[0] || data.records[0]._fields[1])){
      return res.json({free : data.records[0]._fields[0], prem: data.records[0]._fields[1], user: data.records[0]._fields[2] })
    }
    else{
      return res.end();
    }

  })
 })

var torrentQuery = "OPTIONAL MATCH (a:Author)-[]->(s) " + 
  "WITH s, a, count " +  
  "OPTIONAL MATCH (e:Edition)<-[:PUB_AS]-(s) " +
  "WITH s,a,e, count " +
  "OPTIONAL MATCH (t:Torrent)<-[:DIST_AS]-(e) WHERE t.deleted = false " +
  "WITH s,a,e,t,count, {total_size_bytes : t.total_size_bytes, USD_price : t.USD_price, copyrighted : t.copyrighted, payWhatYouWant : t.payWhatYouWant, " +
  "payment : t.payment, uuid : t.uuid, ETH_address: t.ETH_address, format : t.format ,media: t.media, uploaderUUID : t.uploaderUUID, "  +
    "uploaderUser : t.uploaderUser, snatches: t.snatches, created_at : t.created_at, infoHash :t.infoHash, numPeers:  t.numPeers} AS torrent " +  
  "OPTIONAL MATCH (c:Class)-[:TAGS]->(s) " +
  "WITH s, a, collect(DISTINCT{edition : e, torrent: torrent} ) AS edition_torrents, c, count "

app.post("/torrents", [check("start").trim().escape(), check("length").trim().escape()], async function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()

  var query = '';

  var params = {};
  query += "MATCH (so:Source) " +
  "WITH count(so) AS count "
  + "MATCH (s:Source) "
  query += torrentQuery;
  switch(req.body.order[0].column){
    case '0':
      query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;
    case '1':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.title ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.title DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      break;
    case '3':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.adjDate ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.adjDate DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      break;    
    case '2':
      console.log("SNATCHES SORT")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.snatches ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.snatches DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '4':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.updated ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    default :
      query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;

  }

  params = {skip : req.body.start, limit : req.body.length}

  session.run(query , params).then(async data => {
      session.close()    
      var recordsTotal;
      var recordsFiltered;
      if(data.records.length > 0){
        recordsTotal = parseInt(data.records[0]._fields[4]);
        recordsFiltered = parseInt(data.records[0]._fields[4])
      }
      return res.json({recordsTotal: recordsTotal, recordsFiltered: recordsFiltered, data: data.records});  
      /*try {
        if(req.body.start === "0" && req.body.order[0].column === "0" || (req.body.order[0].column === "4" && req.body.order[0].dir === "desc")){
          await redisClient.set("torrents", JSON.stringify({
          recordsTotal : parseInt(data.records[0]._fields[4]),
          recordsFiltered: parseInt(data.records[0]._fields[4]), 
          data : data.records}))

          console.log("CACHING TORRENTS");
        }
        
        

      } catch (error) {
        console.error(error);
        res.status(404).send("Data unavailable");
      }*/
    })
})


 function graphQuery(label){
  var query = ""
  if(label === "Source"){
    query += "MATCH (s:Source {uuid : $uuid})-[]-(c:Class) "
  }
  else if(label === "Class"){
    query += "MATCH (c1:Class {uuid : $uuid })-[]->(s:Source) WITH s, c1 ORDER BY s.snatches DESC LIMIT 33 "
  }
  else if(label === "Author"){
    query += "MATCH (a0:Author {uuid : $uuid})-[]->(s:Source) "
  }
  else if(label === "Publisher"){
    query += "MATCH (e:Edition {publisher : $publisher})<-[]-(s:Source) " 
    query += "WITH e, s "
  }
  query += "MATCH (s)-[]-(c:Class)  " +
    "CALL {"
  if(label === "Source"){
    query += "WITH s, c "
  }
  else if(label === "Class"){
    query += "WITH s, c, c1 "
  }
  else if(label === "Author"){
    query += "WITH a0, s, c "
  }
  else if(label === "Publisher"){
    query += "WITH e, s,c  " 
  }
  query += "MATCH (c)-[]->(s2:Source) " +
      "RETURN s2, rand() AS r " +
      "ORDER BY r LIMIT 4 " +
    "}"
  if(label === "Source"){
    query += "WITH s, s2, c "
  }
  else if(label === "Class"){
    query += "WITH s2, c, c1 "
  }
  else if(label === "Author"){
    query += "WITH a0, s2, c "
  }
  else if(label === "Publisher"){
    query += "WITH e, s2,c " 
  }
  query += "MATCH (s2)<-[]-(a:Author) " + 
     "MATCH (s2)-[]-(c2:Class) " +
     "OPTIONAL MATCH (e2:Edition)<-[]-(s2) WHERE e2.publisher <> ''" 
  return query;
 } 


app.get("/source_graph/:uuid", check("uuid").trim().escape(), function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()
  var query = ""
  console.log("UUID : ", req.params.uuid)
  var query = 'MATCH (s:Source {uuid: $uuid}) ' 
  query += graphQuery("Source")
  query += "RETURN s2, c, a, e2, s, c2 ORDER BY s.snatches DESC LIMIT 150 "

  var params = {uuid : req.params.uuid}

  session.run(query , params).then(data => {
      session.close()
      console.log(util.inspect(data.records))
      return res.json({data: data.records});
  })

})

app.get("/author_graph/:uuid", check("uuid").trim().escape(), function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()
  console.log("UUID : ", req.params.uuid)
  var query = ""
  query += graphQuery("Author");
  query += "RETURN s2, c, a, e2, a0, c2 ORDER BY a0.snatches DESC LIMIT 150 "

  var params = {uuid : req.params.uuid}

  session.run(query , params).then(data => {
      console.log("RECORDS: " + util.inspect(data.records))
      session.close()
      return res.json({data: data.records});
  })

})

app.get("/class_graph/:uuid", check("uuid").trim().escape(), function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()
  var query = ""
  console.log("UUID : ", req.params.uuid)
  query += graphQuery("Class")
  query += "RETURN s2, c, a, e2, c1,c2 ORDER BY c1.snatches DESC LIMIT 150 "

  var params = {uuid : req.params.uuid}

  session.run(query , params).then(data => {
      console.log("RECORDS: " + util.inspect(data.records))
      session.close()
      return res.json({data: data.records});
  })

})

app.get("/publisher_graph/:publisher", check("publisher").trim().escape(), function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()
  console.log("UUID : ", req.params.uuid)
  var query = ""
  query += graphQuery("Publisher")
  query += "RETURN s2, c, a, e2, e,c2 ORDER BY e.snatches DESC LIMIT 150 "

  var params = {publisher : he.encode(he.decode(he.decode(req.params.publisher)))}

  session.run(query , params).then(data => {
      console.log(data.records)
      session.close()
      return res.json({data: data.records});
  })

})

app.post("/source/:uuid", check("uuid").trim().escape().not().isEmpty(), function(req,res){

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session()

    var query = '';

    query += "MATCH (s:Source {uuid : $uuid}) "
    query += "OPTIONAL MATCH (a:Author)-[]->(s) " + 
    "WITH s, a " +  
    "MATCH (e:Edition)<-[:PUB_AS]-(s) " +
    "WITH s,a,e " +
    "OPTIONAL MATCH (t:Torrent)<-[:DIST_AS]-(e) WHERE t.deleted = false " +
    "WITH s, a, e,  {total_size_bytes : t.total_size_bytes, copyrighted : t.copyrighted, payWhatYouWant : t.payWhatYouWant, " +
    "payment : t.payment, USD_price: t.USD_price, uuid : t.uuid, ETH_address: t.ETH_address, format : t.format ,media: t.media, uploaderUUID : t.uploaderUUID, "  +
      "uploaderUser : t.uploaderUser, snatches: t.snatches, created_at : t.created_at, infoHash : t.infoHash, numPeers:  t.numPeers} AS torrent " + 
    "OPTIONAL MATCH (c:Class)-[:TAGS]->(s) " +
    "WITH s, a, collect(DISTINCT{edition: e, torrent: torrent}) AS edition_torrents, c, count(s) AS count "
    switch(req.body.order[0].column){
    case '0':
      query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;
    case '1':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.title ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.title DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      break;
    case '3':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.adjDate DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.adjDate DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '2':
      console.log("SNATCHES SORT")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.snatches DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.snatches DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '4':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    default :
      query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;

  }

    var params = {uuid : req.params.uuid, skip : req.body.start, limit : req.body.length};

    session.run(query , params).then(data => {
        session.close()
        return res.json({recordsTotal: 1, recordsFiltered: 1, data: data.records});
    })  

})

app.post("/author/:uuid", check("uuid").trim().escape().not().isEmpty(), function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()

  var query = '';

  query +=
  "MATCH (a1:Author {uuid : $uuid})-[]->(so:Source) " + 
  "WITH a1, count(so) AS count " +
  "MATCH (a2:Author {uuid : $uuid})-[]->(s:Source) " + 
  "MATCH (a:Author)-[]-(s) " +
  "WITH a1, a, s, count " +  
  "MATCH (e:Edition)<-[:PUB_AS]-(s) " +
  "WITH a1, s,a,e, count " +
  "OPTIONAL MATCH (t:Torrent)<-[:DIST_AS]-(e) WHERE t.deleted = false " +
  "WITH a1, s, a, e,  {total_size_bytes : t.total_size_bytes, USD_price: t.USD_price, copyrighted : t.copyrighted, payWhatYouWant : t.payWhatYouWant, " +
  "payment : t.payment, uuid : t.uuid, ETH_address: t.ETH_address, format : t.format ,media: t.media, uploaderUUID : t.uploaderUUID, "  +
    "uploaderUser : t.uploaderUser, snatches: t.snatches, created_at : t.created_at, infoHash: t.infoHash,numPeers:  t.numPeers} AS torrent ,count " +
  "OPTIONAL MATCH (c:Class)-[:TAGS]->(s) " +
  "WITH a1, s,a, collect(DISTINCT {edition: e, torrent: torrent}) AS edition_torrents, c, count "
  switch(req.body.order[0].column){
    case '0':
      query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, a1 ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;
    case '1':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, a1 ORDER BY s.title ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, a1 ORDER BY s.title DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      break;
    case '3':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, a1 ORDER BY s.adjDate ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, a1 ORDER BY s.adjDate DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '2':
      console.log("SNATCHES SORT")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, a1 ORDER BY s.snatches ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, a1 ORDER BY s.snatches DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '4':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, a1 ORDER BY s.updated ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, a1 ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    default :
      query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, a1 ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;

  }

  var params = {skip : req.body.start, limit : req.body.length, uuid : req.params.uuid}

  session.run(query , params).then(data => {
      session.close()
      if(data.records && data.records.length > 0){
        return res.json({recordsTotal: parseInt(data.records[0]._fields[4]), recordsFiltered: parseInt(data.records[0]._fields[4]), data: data.records});
        
      }
      else{
        return res.json({recordsTotal: 0, recordsFiltered : 0, data: data.records})
      }
  })

})

app.post("/class/:uuid", check("uuid").trim().escape().isLength({max : 256}), 
  check("skip").trim().escape(),
  check("length").trim().escape(),
  function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(util.inspect(errors.array()));
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()

  var query = 'MATCH (cl:Class {uuid : $uuid}) '
  query += "WITH cl "
  query += "OPTIONAL MATCH (cl)-[:TAGS]->(so:Source) " 
  query += "WITH cl, count(so) AS count "
  query += "MATCH (c:Class {uuid: $uuid}) "
  query += "WITH cl, c, count "
  query += "MATCH (c)-[:TAGS]->(s:Source) " +
  "WITH cl, count, s " +
  "OPTIONAL MATCH (cla:Class)-[:TAGS]->(s) " +
  "WITH cl, count, s, cla " +
  "OPTIONAL MATCH (a:Author)-[]->(s) " + 
  "WITH cl, s, a, count, cla " +  
  "OPTIONAL MATCH (e:Edition)<-[:PUB_AS]-(s) " +
  "WITH cl, s,a,e, count, cla " +
  "OPTIONAL MATCH (t:Torrent)<-[:DIST_AS]-(e) WHERE t.deleted = false " +  
  "WITH s, a, cla, count, e, {total_size_bytes : t.total_size_bytes, copyrighted : t.copyrighted, payWhatYouWant : t.payWhatYouWant, " +
  "payment : t.payment, USD_price: t.USD_price, uuid : t.uuid, ETH_address: t.ETH_address, format : t.format ,media: t.media, uploaderUUID : t.uploaderUUID, "  +
    "uploaderUser : t.uploaderUser, snatches: t.snatches, created_at : t.created_at, infoHash  : t.infoHash, numPeers:  t.numPeers} AS torrent, cl " +
  "WITH s, a, cla, collect(DISTINCT {edition: e, torrent: torrent}) AS edition_torrents, count,cl "
  switch(req.body.order[0].column){
    case '0':
      query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count,cl ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;
    case '1':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count,cl ORDER BY s.title ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count,cl ORDER BY s.title DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      break;
    case '3':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count,cl ORDER BY s.adjDate ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count,cl ORDER BY s.adjDate DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '2':
      console.log("SNATCHES SORT")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count,cl ORDER BY s.snatches ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count,cl ORDER BY s.snatches DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '4':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count,cl ORDER BY s.updated ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count,cl ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    default :
      query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count,cl ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;

  }
  var params = {uuid : he.decode(req.params.uuid), skip: req.body.start, limit: req.body.length};
  session.run(query , params).then(data => {
      session.close()
      var recordsTotal;
      var recordsFiltered;
      if(data.records.length > 0){
        recordsTotal = parseInt(data.records[0]._fields[4]);
        recordsFiltered = parseInt(data.records[0]._fields[4])
      }
      return res.json({recordsTotal: recordsTotal, recordsFiltered: recordsFiltered, data: data.records});
    })
})

app.post("/publisher/:publisher", [check("start").trim().escape(), check("publisher").trim().escape().not().isEmpty(), check("length").trim().escape()], function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()

  var query = '';

  var params = {};

  query += "MATCH (so:Source)-[]-(e:Edition {publisher : $publisher}) " +
  "WITH count(so) AS count "
  + "MATCH (s:Source)-[]-(e1:Edition {publisher : $publisher}) "
  query += "OPTIONAL MATCH (a:Author)-[]->(s) " + 
  "WITH s, a, e1, count " +  
  "OPTIONAL MATCH (e:Edition)<-[:PUB_AS]-(s) " +
  "WITH s,a,e, e1, count " +
  "OPTIONAL MATCH (t:Torrent)<-[:DIST_AS]-(e) WHERE t.deleted = false " +
  "WITH s,a,e, e1, t,count, {total_size_bytes : t.total_size_bytes, USD_price : t.USD_price, copyrighted : t.copyrighted, payWhatYouWant : t.payWhatYouWant, " +
  "payment : t.payment, uuid : t.uuid, ETH_address: t.ETH_address, format : t.format ,media: t.media, uploaderUUID : t.uploaderUUID, "  +
    "uploaderUser : t.uploaderUser, snatches: t.snatches, created_at : t.created_at, infoHash : t.infoHash, numPeers:  t.numPeers} AS torrent " +  
  "OPTIONAL MATCH (c:Class)-[:TAGS]->(s) " +
  "WITH s, a, e1, collect(DISTINCT{edition : e, torrent: torrent} ) AS edition_torrents, c, count "
  switch(req.body.order[0].column){
    case '0':
      query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, e1 ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;
    case '1':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, e1  ORDER BY s.title ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, e1  ORDER BY s.title DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      break;
    case '3':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, e1  ORDER BY s.adjDate ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, e1  ORDER BY s.adjDate DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '2':
      console.log("SNATCHES SORT")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, e1  ORDER BY s.snatches ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, e1  ORDER BY s.snatches DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '4':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, e1  ORDER BY s.updated ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, e1  ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    default :
      query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), count, e1  ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;

  }
  params = {skip : req.body.start, limit : req.body.length, publisher : he.encode(he.decode(he.decode(req.params.publisher)))}
  console.log(params.publisher)
  session.run(query , params).then(data => {
      session.close()      
      var recordsTotal;
      var recordsFiltered;
      if(data.records.length > 0){
        recordsTotal = parseInt(data.records[0]._fields[4]);
        recordsFiltered = parseInt(data.records[0]._fields[4])
      }
      return res.json({recordsTotal: recordsTotal, recordsFiltered: recordsFiltered, data: data.records});
    })
})

app.post("/authors", function(req,res){
  const session= driver.session();
   var query = "MATCH (cl:Author)-[]-(s:Source)  " +
    "WITH count(s) AS count " + 
    "OPTIONAL MATCH (s2:Source)<-[]-(a:Author) " + 
    "WITH TOFLOAT(count(s2)) AS numSources, a, count, a.snatches AS snatches " 
  console.log(req.body.start, req.body.length)
  var params = {skip : req.body.start, limit : req.body.length};

  switch(req.body.order[0].column){
    case '0':
      console.log(req.body.order[0])
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN a, count, numSources, snatches ORDER BY a.author ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 

      }
      else{
        query += "RETURN a, count, numSources, snatches ORDER BY a.author DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 

      }      break;

    case '1':
      console.log("HERE2")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN a, count, numSources, snatches ORDER BY numSources ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 

      }
      else{
        query += "RETURN a, count, numSources, snatches ORDER BY numSources DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 
      }

      break;
    case '2':
      console.log("HERE3")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN a, count, numSources, snatches ORDER BY a.snatches ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 

      }
      else{
        query += "RETURN a, count, numSources, snatches ORDER BY a.snatches DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 

      }
      break;
    default :
      console.log("HERE4")
        query += "RETURN a, count, numSources, snatches ORDER BY numSources DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 
        break;

  }
  console.log(query)
  session.run(query , params).then(data => {
    session.close()
    var count = 0;
      console.log(util.inspect(data.records[0]._fields[0]));

    if(data.records && data.records[0]){
      return res.json({recordsTotal: parseInt(data.records[0]._fields[1]), recordsFiltered: parseInt(data.records[0]._fields[1]), data: data.records});
    }
    else{
      return res.json({ errors : [{msg : "Error loading torrents"}]});
    }
  })  

})

app.post("/classes", function(req,res){
  const session = driver.session()

  var query = "MATCH (cl:Class)-[]-(s1:Source) WHERE cl.name <> ''" +
    "WITH count(cl) AS count " + 
    "OPTIONAL MATCH (s:Source)<-[:TAGS]-(c) WHERE c.name <> ''" + 
    "WITH TOFLOAT(count(s)) AS numSources, c, count, c.snatches AS snatches "  
  console.log(req.body.start, req.body.length)
  var params = {skip : req.body.start, limit : req.body.length};

  switch(req.body.order[0].column){
    case '0':
      console.log(req.body.order[0])
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN c, count, numSources, snatches ORDER BY c.name ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 

      }
      else{
        query += "RETURN c, count, numSources, snatches ORDER BY c.name DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 

      }      break;

    case '1':
      console.log("HERE2")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN c, count, numSources, snatches ORDER BY numSources ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 

      }
      else{
        query += "RETURN c, count, numSources, snatches ORDER BY numSources DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 
      }

      break;
    case '2':
      console.log("HERE3")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN c, count, numSources, snatches ORDER BY c.snatches ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 

      }
      else{
        query += "RETURN c, count, numSources, snatches ORDER BY c.snatches DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 

      }
      break;
    default :
      console.log("HERE4")
        query += "RETURN c, count, numSources, snatches ORDER BY c.name ASC DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit)" 
        break;

  }
  console.log(query)
  session.run(query , params).then(data => {
    session.close()
    var count = 0;
      console.log(util.inspect(data.records[0]._fields[0]));

    if(data.records && data.records[0]){
      return res.json({recordsTotal: parseInt(data.records[0]._fields[1]), recordsFiltered: parseInt(data.records[0]._fields[1]), data: data.records});
    }
    else{
      return res.json({ errors : [{msg : "Error loading torrents"}]});
    }
  })  

})

app.post("/publishers", function(req,res){
  const session = driver.session()

  var query = "OPTIONAL MATCH (e2:Edition) " + 
    "WHERE NOT e2.publisher = ''" +
    "WITH e2.snatches AS snatches, e2.publisher AS publisher " 

  console.log(req.body.start, req.body.length)
  var params = {skip : req.body.start, limit : req.body.length};

  switch(req.body.order[0].column){
    case '0':
      console.log(req.body.order[0])
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN publisher, snatches ORDER BY publisher ASC " 

      }
      else{
        query += "RETURN publisher,snatches ORDER BY publisher DESC " 

      }      break;

    case '1':
      console.log("HERE2")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN publisher, snatches " 

      }
      else{
        query += "RETURN publisher, snatches " 
      }

      break;
    case '2':
      console.log("HERE3")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN publisher, snatches ORDER BY snatches ASC " 

      }
      else{
        query += "RETURN publisher, snatches ORDER BY snatches DESC " 

      }
      break;
    default :
      console.log("HERE4")
        query += "RETURN publisher, snatches " 
        break;

  }
  console.log(query)
  session.run(query , params).then(data => {
    session.close()
    var count = 0;
      console.log(util.inspect(data.records[0]._fields[0]));

    if(data.records && data.records[0]){
      var publishers = []
      data.records.forEach(function(record){
        let obj = publishers.find(o => o.publisher === record._fields[0]);

        if(!obj){
          publishers.push({"publisher": record._fields[0], "count" : 1, "snatches" : record._fields[1]})
        }
        else{
          obj.count += 1;
          obj.snatches += record._fields[1];
        }
      })

      publishers.forEach(function(e, i){
        if(!e.publisher){
          publishers.splice(i, 1)
        }
      })

      switch(req.body.order[0].column){
        case '0':
          console.log(req.body.order[0])

          if(req.body.order[0].dir === 'asc'){
            publishers = publishers.sort((a, b) => a.publisher.localeCompare(b.publisher));

          }
          else{
            console.log("PUBLISHER DESC")
            publishers = publishers.sort((a, b) => (-1 * a.publisher.localeCompare(b.publisher)));
          }
          break;

        case '1':
          console.log("HERE2")
          if(req.body.order[0].dir === 'asc'){
            publishers = publishers.sort(function ({count : a}, {count : b}) {  return a - b;  });

          }
          else{
            publishers = publishers.sort(function ({count : a}, {count : b}) {  return b - a;  });
          }

          break;
        case '2':
          console.log("HERE3")
          if(req.body.order[0].dir === 'asc'){
            publishers = publishers.sort(function ({snatches : a}, {snatches : b}) {  return a - b;  });

          }
          else{
            publishers = publishers.sort(function ({snatches : a}, {snatches : b}) {  return b - a;  });
          }
          break;
        default :
          console.log("HERE4")

            publishers = publishers.sort((a, b) => a.publisher.localeCompare(b.publisher));

            break;

      }

      console.log(util.inspect(publishers))

      return res.json({recordsTotal: publishers.length, recordsFiltered: publishers.length, 
        data: publishers.slice(req.body.start, parseInt(req.body.start) + parseInt(req.body.length))});
    }
    else{
      return res.json({ errors : [{msg : "Error loading torrents"}]});
    }
  })  

})

function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}
app.get("/upload/:uuid", check("uuid").trim().escape().isLength({max:256}), function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(util.inspect(errors.array()));
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()

  var query = '';
  var params = {};

  query += "MATCH (s:Source {uuid : $uniqueID}) " +
  "WITH s " +
  "OPTIONAL MATCH (a:Author)-[]->(s) " +
  "WITH s, a " +
  "OPTIONAL MATCH (c:Class)-[]->(s) " +
  "WITH s, a, c " +
  "MATCH (e:Edition)<-[:PUB_AS]-(s) " +
  "WITH s,a,e,c, {title : e.title, date: e.date, pages : e.pages, img: e.img, uuid: e.uuid, publisher: e.publisher} AS edition " +
  "OPTIONAL MATCH (t:Torrent)<-[:DIST_AS]-(e) " +
  "WITH s,a,e,c,edition,t " +
  "MATCH (b:Buoy {uuid: 'd2b358ee-b58d-11ed-afa1-0242ac120002'}) " +
  "RETURN s.title AS title, COLLECT(DISTINCT {uuid: a.uuid, author : a.author}) AS author, COLLECT(DISTINCT c.name) AS classes, s.date AS date, " +
  "collect(DISTINCT edition) AS editions, COLLECT(DISTINCT t) AS torrents, s.type AS type, b"

  params["uniqueID"] = req.params.uuid;

  session.run(query , params).then(data => {
    session.close();

    return res.json({record : data.records[0], captcha: res.recaptcha, atlsd: req.user ? req.user.atlsd : ""});
  })
})
var web3Transactions = [];

app.post("/receipt_confirmed/:uuid", check("transactionHash").not().isEmpty().trim().escape(), check("torrentUUID").not().isEmpty().trim().escape(), function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(util.inspect(errors.array()));
    return res.json({ errors: errors.array() });
  }
  var query = "MATCH (t:Torrent{uuid:$torrentUUID}) " +
      "MATCH (u:User {uuid: $user}) " + 
      "MERGE (u)-[b:BOUGHT {uuid : $uuid}]->(t) " +
      "SET b.confirmed = true " + 
      "RETURN t.infoHash "
  var params = {user : req.user ? req.user.uuid : "null", uuid : req.params.uuid, torrentUUID : req.body.torrentUUID}

  var session = driver.session();
  session.run(query,params).then(data=>{
    session.close();

    return res.json({bought: true, infoHash : data.records[0] && data.records[0]._fields[0] ? data.records[0]._fields[0] : null});

  })
})

app.get("/buyPrice/:uuid", check("uuid").not().isEmpty(), function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(util.inspect(errors.array()));
      return res.json({ errors: errors.array() });
    }
    var query = "MATCH (u:User{uuid:$user}) " +
    "MATCH (t:Torrent{uuid : $uuid}) " +
    "OPTIONAL MATCH (u)-[b:BOUGHT]->(t) " +
    "RETURN t.USD_price, b.confirmed"
    var params = {uuid : req.params.uuid, user: req.user ? req.user.uuid : "null"};
    var session = driver.session();
    session.run(query,params).then(data=>{
      session.close();
      res.json({USD_price
: (data.records[0] && data.records[0]._fields[0]) ? data.records[0]._fields[0] : null, confirmed : data.records[0]._fields[1]})
    })
})

app.post("/dl/:infoHash", check("infoHash").trim().escape().not().isEmpty(), check("numPeers").trim().escape().not().isEmpty(), function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(util.inspect(errors.array()));
    return res.json({ errors: errors.array() });
  }

  var session = driver.session();
  var params = {infoHash: req.params.infoHash, numPeers : parseInt(req.query.numPeers), user : req.user ? req.user.uuid : "null"};
  var query = "MATCH (t:Torrent {infoHash: $infoHash})-[]-(e:Edition) " +
  "SET t.numPeers = TOFLOAT($numPeers) " +
  "WITH t, e MATCH (to:Torrent)-[]-(e) " +
  "WITH t, e, TOFLOAT(SUM(to.numPeers)) AS numPeers " +
  "SET e.numPeers = numPeers " +
  "WITH t " +
  "MATCH (to:Torrent)-[]-(e1:Edition)-[]-(s:Source)-[]-(e:Edition)-[]-(t) " +
  "WITH t, TOFLOAT(SUM(to.numPeers)) AS numPeers, s " +
  "SET s.numPeers = numPeers " +
  "WITH t " +
  "MATCH (u:User {uuid : $user}) " + 
  "SET u.downloaded = TOFLOAT(u.downloaded) + 1 "

  console.log("PEERLESS :) " + req.query.numPeers);
  session.run(query,params).then(data=>{

    session.close();
    res.end();
  })

})

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
    return index === 0 ? decodeEntities(decodeEntities(word.toLowerCase())) : decodeEntities(decodeEntities(word.toUpperCase()));
  }).replace(/\s+/g, '');
}


app.post("/upload/:uuid", isKing, check("APA").trim().escape(), check("public_domain").trim().escape(), check("copyrighted").trim().escape(), check("payWhatYouWant").trim().escape(),
  check("payment").trim().escape(), check("access").trim().escape(), check("type").trim().escape(), 
  check("edition_no").trim().escape().isLength({max: 256}), check("ETH_address").trim().escape().isLength({max:256}), check("USD_price").trim().escape().isLength({max:256}), check("edition_img").trim().escape().isLength({max:9000}), check("edition_pages").trim().escape().isLength({max :256}), check("edition_publisher").trim().escape().isLength({max:256}), check("uuid").trim().escape().isLength({max:256}), check("edition_date").trim().escape().isLength({max:256}), 
  check("date").trim().escape().isLength({max:256}), check("classes").trim().escape().toLowerCase().isLength({max:9000}), check("torrent").trim().escape().isLength({max:9000}),
   check("edition_title").trim().escape().isLength({max:256}), check("authors").trim().escape().isLength({max : 9000}), check("edition_uuid").trim().escape(),
   check("title").trim().escape().not().isEmpty().isLength({max : 256}).withMessage("Primary Source Title must be <= 256 characters"), async function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(util.inspect(errors.array()));
      return res.json({ errors: errors.array() });
    }

    if(req.body.copyrighted === "true" && !req.body.ETH_address){
      return res.json({errors : [{msg: "You must enter an ETH address if your work is copyrighted."}]});
    }
    if(!req.body.public_domain && !req.body.payment){
      return res.json({errors: [{msg: "Please certify that you have the copyrights to this work, or that it is in the public domain! If it is not freely found on Google, do not upload it."}]})
    }
    if(req.body.copyrighted === "false" && req.body.public_domain === "false"){
      req.body.public_domain = true;
    }
    console.log("UPL REQUEST!")

    if(req.body.authors){
      var authors = JSON.parse(he.decode(req.body.authors));
    }

    console.log(req.params.uuid);

    var torrent = JSON.parse(he.decode(req.body.torrent));

    console.log("LINK ADDRESS: " + req.body.ETH_address)
    if(req.params.uuid === "undefined" && torrent && !torrent.infoHash){
      return res.json({errors : [{msg : "You must upload a torrent file."}]})
    }

    const session = driver.session()

    var query = '';
    var params = {};

    var edition;
    if(req.body.edition_title.length === 0){
      edition = ""
    }
    else{
      edition = req.body.edition_title;
    }

    var classes = JSON.parse(he.decode(req.body.classes));
    if(classes[0] === ['']){
      classes = []
    }
    else{
      for (var i = 0; i < classes.length; i++) {
       classes[i] = he.encode(classes[i].trim())
      }  
    }

    var date = req.body.date;
    var adjDate = 0;

    if(date){
       if(date.indexOf("B.C.") > -1 || date.indexOf("BC") > -1 || date.indexOf("BCE") > -1 || date.indexOf("B.C.E.") > -1 ){
        if(date.indexOf("Century") === -1 && date.indexOf("century") === -1){
          if(date.indexOf("-") > -1){
            adjDate = date.substring(0, date.indexOf("-"))
          }
          adjDate = date.replace(/\D/g, "");
          adjDate = (parseFloat(adjDate) * -1) * 100;
        }
        else{
          if(date.indexOf("-") > -1){
            adjDate = date.substring(0, date.indexOf("-"))
          }
          adjDate = date.replace(/\D/g, "");
          adjDate = parseFloat(adjDate) * -1;
        }
      }
      else if(date.indexOf("Century") === -1 || date.indexOf("century") === -1){
        if(date.indexOf("-") > -1){
            adjDate = date.substring(0, date.indexOf("-"))
        }
        adjDate = date.replace(/\D/g, "");
        adjDate = parseFloat(adjDate);
      }
      else{
        if(date.indexOf("-") > -1){
            adjDate = date.substring(0, date.indexOf("-"))
        }
        adjDate = date.replace(/\D/g, "");
        adjDate = parseFloat(adjDate) * 100;

      }
    }

    if(req.params.uuid === "undefined"){

      async function newUpload(){

          query += 'MATCH (ua:User {uuid : $user})-[ac:ACCESS]->(h:Buoy {uuid:"d2b358ee-b58d-11ed-afa1-0242ac120002"}) ' +
          "SET ac.uploads = ac.uploads + 1 " +
          'WITH ac, ua ' +
          'MERGE (s:Source {title : $sourceTitle, snatches: toFloat(0), counter : 1, top10: DATETIME(), count : 0, ' +
          'type: $sourceType, date: $sourceDate, adjDate : $adjDate, uuid : $uniqueID, updated : toFloat(TIMESTAMP()), ' +
          'created_at: toFloat(TIMESTAMP())}) ' +

            'FOREACH( ' + 
              'class IN $classes | MERGE (c:Class {name : class}) ' +
              'ON CREATE SET c.uuid = randomUUID(), c.snatches = toFloat(0) ' +
              'MERGE (s)<-[:TAGS]-(c) ' + 
            ') ' +
            'MERGE (e:Edition {title : $editionTitle, snatches: toFloat(0), publisher: $editionPublisher, uuid : randomUUID()})<-[:PUB_AS]-(s) ' +
            'SET e.pages = $editionPages, e.no = $editionNo, e.date = $editionDate, e.img = $editionIMG, e.created_at = toFloat(TIMESTAMP()) ' +     
            'MERGE (t:Torrent {mintChecked : false, public_domain: $public_domain, infoHash : $infoHash, media : $media, format: $format})<-[:DIST_AS]-(e) ' +
            'ON CREATE SET t.payment = $payment, t.payWhatYouWant = $payWhatYouWant, t.copyrighted = $copyrighted, ' +
            't.snatches = toFloat(0), t.uuid = randomUUID(), t.uploaderUUID = $user, t.uploaderUser = $name, t.ETH_address = $ETH_address, ' +
            ' t.USD_price = $USD_price, t.created_at = toFloat(TIMESTAMP()), t.deleted = false ' +
            'ON MATCH SET t.created_at = toFloat(TIMESTAMP()) ' +
            "MERGE (ua)-[:UPLOADED]->(t) " 

          params["sourceTitle"] = he.encode(req.body.title);
          params["sourceDate"] = he.encode(req.body.date);
          params["adjDate"] = adjDate;
          params["editionTitle"] = he.encode(edition);
          params["editionIMG"] = req.body.edition_img ? he.encode(req.body.edition_img) : null;
          params["editionPublisher"] = he.encode(req.body.edition_publisher)
          params["editionPages"] = he.encode(req.body.edition_pages);
          params["editionDate"] = he.encode(req.body.edition_date);
          params["editionNo"] = he.encode(req.body.edition_no);
          params["uniqueID"] = uuidv1();
          params["classes"] = classes;
          params["sourceType"] = he.encode(req.body.type);
          params["infoHash"] = torrent.infoHash;
          params["media"] = torrent.media;
          params["format"] = torrent.format;
          params["user"] = req.user ? req.user.uuid : "null";

          params["name"] = req.user ? req.user.user : "Anonymous"
          params["ETH_address"] = req.body.ETH_address;
          params["USD_price"] = parseFloat(req.body.USD_price) ? parseFloat(req.body.USD_price
) : 0.0;
          params["public_domain"] = req.body.public_domain === "true" ? true : false;
          params["copyrighted"] = req.body.copyrighted === "true" ? true : false;
          params["payWhatYouWant"] = req.body.payWhatYouWant === "true" ? true : false;
          params["payment"] = req.body.payment === "true" ? true : false;

          if(authors && authors.length > 0){
            authors.forEach(function(author, i){  

              switch(author.importance){
                case "author":
                  authorImportance = "AUTHOR";
                  break;
                case "editor" : 
                  authorImportance = "EDITOR";
                  break;
                case "translator":
                  authorImportance = "TRANSLATOR";
                  break;
                default:
                  authorImportance = "AUTHOR";
                  break;
              }

              query += 'WITH s, ac, t ' + 
              'OPTIONAL MATCH (a:Author {uuid : $uniqueID' + i + '}) ' +
              'WITH s, a, t, ac ' + 
              'MERGE (s)<-[au:' + authorImportance + ' {role : $authorRole' + i + '}]-(a) '
              'RETURN s.uuid AS uuid, ac, t.infoHash AS infoHash '
              params["uniqueID" + i] = author.uuid;
              params["authorRole" + i] = author.role
            })
          }
          query += 'RETURN s.uuid AS uuid, ac, t.infoHash AS infoHash '

          session.run(query , params).then(async data => {
                session.close()
                var classTags = ""
                classes.forEach(function(c, i){
                  classTags += "#" + he.decode(camelize(c))
                  if(i !== classes.length - 1){
                    classTags += ", "
                  }
                })
               // setTimeout(function(){
                  /*postTweet(he.decode(req.body.APA.substring(0, 180)) + " " + params.format +
                       " Torrent at propagate.info/#source?uuid=" + data.records[0]._fields[0] + " " +
                      classTags)
                },1000)*/
                
                console.log(classes, classTags)
                if(req.user){

                  promote(data.records[0]._fields[1].properties)

                }
                console.log(data.records[0]._fields[0]);
                
                return res.json({"uuid" : data.records[0]._fields[0]});
            })  
          .catch(function(err){
            console.log(err);
            if(err.code === "Neo.ClientError.Schema.ConstraintValidationFailed"){
              err = "Torrent infoHash already exists on the site."
            }
            console.log("NEO4J ERROR: " + err);
            return res.json({errors: [{msg : err}]})
          })
      }

      newUpload();

    }

    else{

      var edition_uuid;
      console.log("EDITION UUID: " + req.body.edition_uuid);
      console.log("SOURCE UUID " + params.uniqueID)
      if(req.body.edition_uuid === "null"){
        edition_uuid = uuidv1();
      }
      else{
        edition_uuid = req.body.edition_uuid;
      }

       if(torrent.infoHash){
        query += 'MATCH (s:Source {uuid : $uniqueID}) ' +
        "SET s.updated = toFloat(TIMESTAMP()), s.top10 = DATETIME() " +
        'WITH s ' +
        "OPTIONAL MATCH (e:Edition {uuid:$edition_uuid}) " +
        "SET e.date = $editionDate, e.no = $editionNo, e.title = $editionTitle, e.publisher = $editionPublisher, e.pages = $editionPages " +
        "WITH s " 
        query += 'MERGE (e1:Edition {uuid : $edition_uuid})<-[pu:PUB_AS]-(s) ' +
       'ON CREATE SET e1.snatches = toFloat(0), e1.no = $editionNo, e1.date = $editionDate, e1.created_at = toFloat(TIMESTAMP()),' + 
       'e1.pages = $editionPages, e1.title = $editionTitle, e1.publisher = $editionPublisher ' 
        query += "WITH s, e1 MERGE (t:Torrent {snatches: toFloat(0), infoHash : $torrentInfoHash, created_at: toFloat(TIMESTAMP()), "+
        "deleted : false, uuid: randomUUID(), media : $torrentMedia, uploaderUUID : $userUUID, uploaderUser : $user, " +
        "USD_price : $USD_price, ETH_address : $ETH_address, format: $torrentFormat, payment : $payment, public_domain: $public_domain, "+
        "payWhatYouWant : $payWhatYouWant, copyrighted : $copyrighted" +
        "})<-[di:DIST_AS]-(e1) " 

       }

      params["uniqueID"] = req.params.uuid;
      params["classes"] = classes;
      params["editionIMG"] = req.body.edition_img !== null ? he.encode(req.body.edition_img) : null;
      params["sourceTitle"] = he.encode(req.body.title)
      params["sourceDate"] = he.encode(req.body.date)
      params["editionPublisher"] = he.encode(req.body.edition_publisher)
      params["editionPages"] = he.encode(req.body.edition_pages);
      params["editionDate"] = he.encode(req.body.edition_date);
      params["editionTitle"] = he.encode(req.body.edition_title);
      params["editionNo"] = he.encode(req.body.edition_no);
      params["torrentInfoHash"] = torrent.infoHash;
      params["torrentMedia"] = torrent.media;
      params['torrentFormat'] = torrent.format;

      params["sourceType"] = he.encode(req.body.type)
      params["edition_uuid"] = edition_uuid;

      params["userUUID"] = req.user ? req.user.uuid : "null";

      params["user"] = req.user ? req.user.user : "Anonymous"
      params["ETH_address"] = req.body.ETH_address;
      params["USD_price"] = parseFloat(req.body.USD_price
) ? parseFloat(req.body.USD_price
) : 0.0;
      params["public_domain"] = req.body.public_domain === "true" ? true : false;
      params["copyrighted"] = req.body.copyrighted === "true" ? true : false;
      params["payWhatYouWant"] = req.body.payWhatYouWant === "true" ? true : false;
      params["payment"] = req.body.payment === "true" ? true : false;
      var authors = JSON.parse(he.decode(req.body.authors));

      var authorImportance; 

      query += 'RETURN s.uuid AS uuid, t.infoHash AS infoHash '
      console.log(query);
      session.run(query , params).then(async data => {
            session.close()
            var classTags = ""
            classes.forEach(function(c, i){
              classTags += "#" + he.decode(camelize(c))
              if(i !== classes.length - 1){
                classTags += ", "
              }
            })
           /* postTweet(he.decode(req.body.APA.substring(0, 180)) + " " + params.torrentFormat + 
                 " Torrent at propagate.info/#source?uuid=" + data.records[0]._fields[0] + " " +
                classTags)*/

            
            return res.json({"uuid" : data.records[0].get("uuid")});
        })  
      .catch(function(err){
        if(err.code === "Neo.ClientError.Schema.ConstraintValidationFailed"){
          err = "Torrent infoHash already exists on the site."
        }
        console.log("ERROR: " + err);
        return res.json({errors: [{msg : err}]})
      })
    }
})

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

app.post("/create_author", check("author").trim().escape().not().isEmpty().isLength({max : 256}).withMessage("Author must be <= 256 characters"), function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session()
    var searchableDecoded = he.decode(req.body.author);
    var searchable = he.encode(searchableDecoded.split(",")[0]);
    console.log("Create Author: " + req.body.author);
    session.run('MERGE (a:Author {author : $authorName, searchable : $searchable, snatches : toFloat(0)}) ' +
    'ON CREATE SET a.uuid = $uniqueID ' +
    'RETURN a.uuid AS uuid, a.author AS author' ,{authorName : he.encode(req.body.author), searchable : searchable, uniqueID : uuidv1()}).then(data => {
        session.close()
        return res.json({uuid : data.records[0].get('uuid'), author : data.records[0].get('author')});
    })    
})

app.post("/add_author", check("author").trim().escape().not().isEmpty().isLength({max : 256}).withMessage("Author must be <= 256 characters"), function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session()
    console.log("Add Author: " + req.body.author);
    session.run('MATCH (a:Author {author : $authorName}) ' +
      'RETURN a.uuid AS uuid, a.author AS author', {authorName : he.decode(req.body.author)}).then(data => {
        session.close()
        if(data.records[0]){
          return res.json({uuid : data.records[0].get('uuid'), author : data.records[0].get('author')});
        }
        else{
          return res.json({});
        }
      })  
})

app.post("/snatched/:id", check("id").trim().escape().not().isEmpty().isInt().isLength({min : 3, max : 10}), function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session()

    console.log(req.params.infoHash);

    var query = "MATCH (t:Torrent{total_size_bytes:$id}) " + 
                "SET t.snatches = toFloat(t.snatches + 1) " +
                "WITH t " + 
                "MATCH (e:Edition)-[:DIST_AS]->(t) " +
                "SET e.snatches = toFloat(e.snatches + 1) " +
                "WITH t, e " +
                "MATCH (s:Source)-[:PUB_AS]->(e) " +
                "SET s.snatches = toFloat(s.snatches + 1) " +
                "SET s.lastSnatched = DATETIME() " +
                "WITH s, t, e " +
                "MATCH (c:Class)-[:TAGS]-(s) " +
                "SET c.snatches = toFloat(c.snatches + 1), c.updated = DATETIME() " +
                "WITH s,t " +
                "MATCH (a:Author)-[:AUTHOR]->(s) " +
                "SET a.snatches = toFloat(a.snatches +1) " +
                "WITH t, s " +
                "SET s.count = s.count + 1" 

    var params = {id: parseInt(req.params.id), user : req.user ? req.user.uuid : "null"}

    session.run(query,params).then(async data => {
      session.close();
      
      return res.end();
    })
})

app.post("/snatched/:infoHash", check("infoHash").trim().escape().not().isEmpty(), async function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session()

    console.log(req.params.infoHash);

    var query = "MATCH (t:Torrent{infoHash:$infoHash}) " + 
                "SET t.snatches = toFloat(t.snatches + 1) " +
                "WITH t " + 
                "MATCH (e:Edition)-[:DIST_AS]->(t) " +
                "SET e.snatches = toFloat(e.snatches + 1) " +
                "WITH t, e " +
                "MATCH (s:Source)-[:PUB_AS]->(e) " +
                "SET s.snatches = toFloat(s.snatches + 1) " +
                "SET s.lastSnatched = DATETIME() " +
                "WITH s, t, e " +
                "MATCH (c:Class)-[:TAGS]-(s) " +
                "SET c.snatches = toFloat(c.snatches + 1), c.updated = DATETIME() " +
                "WITH s,t " +
                "MATCH (a:Author)-[:AUTHOR]->(s) " +
                "SET a.snatches = toFloat(a.snatches +1) " +
                "WITH t, s " +
                "SET s.count = s.count + 1" 

    var params = {infoHash: he.decode(req.params.infoHash), user : req.user ? req.user.uuid : "null"}

    session.run(query,params).then(async data => {
      session.close();
      
      return res.end();
    })
})


var top10Query = "WITH s, count ORDER BY s.snatches DESC LIMIT 250 " +
    "OPTIONAL MATCH (a:Author)-[]->(s) " + 
    "WITH s, a, count " +  
    "OPTIONAL MATCH (e:Edition)<-[:PUB_AS]-(s) " +
    "WITH s,a,e, count " +
    "OPTIONAL MATCH (t:Torrent)<-[:DIST_AS]-(e) WHERE t.deleted = false " +
    "WITH s,a,e,t, count, {total_size_bytes : t.total_size_bytes, copyrighted : t.copyrighted, payWhatYouWant : t.payWhatYouWant, " +
    "payment : t.payment, USD_price : t.USD_price, uuid : t.uuid, ETH_address: t.ETH_address, format : t.format ,media: t.media, uploaderUUID : t.uploaderUUID, "  +
      "uploaderUser : t.uploaderUser, snatches: t.snatches, created_at : t.created_at, numPeers:  t.numPeers, infoHash : t.infoHash} AS torrent " +  
    "OPTIONAL MATCH (c:Class)-[:TAGS]->(s) " +
    "WITH s, a, collect(DISTINCT{edition : e, torrent: torrent} ) AS edition_torrents, c, count "

app.post("/top10/:time", check("time").trim().escape(), async function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session()

    var params = {limit : req.body.length, skip : req.body.start, buoy:req.body.buoy}

    switch(req.params.time){
      case "top10_day":
        params.time = "P1D";
        break;
      case "top10_week":
        params.time = "P7D";
        break;
      case "top10_month":
        params.time = "P30D";
        break;
      case "top10_year":
        params.time = "P365D";
        break;
    }

    var query = "WITH DATETIME() - duration($time) AS threshold " +
                "MATCH (s:Source) " + 
                "WHERE s.lastSnatched > threshold " +
                "WITH s LIMIT 250 " +
                "WITH count(s) AS count " +
                "WITH DATETIME() - duration($time) AS threshold, count " +
                "MATCH (s:Source) " + 
                "WHERE s.lastSnatched >threshold "

    query += top10Query;
    query += "WITH s, a, edition_torrents, c, count " 
    query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT c), TOFLOAT(count) ORDER BY s.snatches DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

    session.run(query,params).then(async data => {
      session.close();
      switch(params.time){
        case "P1D":
          await redisClient.set("top10_day", JSON.stringify({
          recordsTotal : data.records && data.records.length > 0 ? parseInt(data.records[0]._fields[4]) : 0,
          recordsFiltered: data.records && data.records.length > 0 ? parseInt(data.records[0]._fields[4]) : 0, 
          data : data.records}))
          console.log("SETTING TOP 10 CACHE")
          break;
        case "P7D":
          await redisClient.set("top10_week", JSON.stringify({
          recordsTotal : data.records && data.records.length > 0 ? parseInt(data.records[0]._fields[4]) : 0,
          recordsFiltered: data.records && data.records.length > 0 ? parseInt(data.records[0]._fields[4]) : 0, 
          data : data.records}))
          console.log("SETTING TOP 10 CACHE")

          break;
        case "P30D":
          await redisClient.set("top10_month", JSON.stringify({
          recordsTotal : data.records && data.records.length > 0 ? parseInt(data.records[0]._fields[4]) : 0,
          recordsFiltered: data.records && data.records.length > 0 ? parseInt(data.records[0]._fields[4]) : 0, 
          data : data.records}))
          console.log("SETTING TOP 10 CACHE")

          break;
        case "P365D":
          await redisClient.set("top10_year", JSON.stringify({
          recordsTotal : data.records && data.records.length > 0 ? parseInt(data.records[0]._fields[4]) : 0,
          recordsFiltered: data.records && data.records.length > 0 ? parseInt(data.records[0]._fields[4]) : 0, 
          data : data.records}))
          console.log("SETTING TOP 10 CACHE")

          break;
      }
      
     var total = 0;
      if(data.records.length > 0){
          total = data.records[0]._fields[4]

        }

      return res.json({recordsTotal : total, recordsFiltered : total, data: data.records});
    })

})

function getTop10Query(type, media, format, publisher, classes, class_all, count){
  var query = ""
   if(type !== "all"){
      query += "MATCH (s {type : $type}) "
      if(count){
        query += "WITH s, e, count "
      }
      else{
        query += "WITH s, e "

      }
    }
   
    if(publisher){
      query += "CALL db.index.fulltext.queryNodes('publisher', $publisher) YIELD node " +
        "MATCH (e)-[]-(s) WHERE e.publisher = node.publisher "
      }
    
  if(count){
    query += "WITH s, e, count "
  }
  else{
    query += "WITH s, e "

  }
  if(media !== "all" && format !== "all"){
    query += "MATCH (t:Torrent {media: $media, format:$format})<-[:DIST_AS]-(e)-[]-(s) WHERE t.deleted = false " 

  }
  else if(media !== "all"){
    query += "MATCH (t:Torrent {media: $media})<-[:DIST_AS]-(e)-[]-(s) WHERE t.deleted = false " 

  }
  else if(format !== "all"){
    query += "MATCH (t:Torrent {format:$format})<-[:DIST_AS]-(e)-[]-(s) WHERE t.deleted = false " 

  }
  else{
    query += "OPTIONAL MATCH (t:Torrent)<-[:DIST_AS]-(e)-[]-(s) WHERE t.deleted = false " 

  }
  if(count){
    query += "WITH count, s,e,t, {USD_price : t.USD_price, copyrighted : t.copyrighted, payWhatYouWant : t.payWhatYouWant, " +
  "payment : t.payment, uuid : t.uuid, ETH_address: t.ETH_address, format : t.format ,media: t.media, uploaderUUID : t.uploaderUUID, "  +
    "uploaderUser : t.uploaderUser, snatches: t.snatches, created_at : t.created_at, numPeers:  t.numPeers, infoHash : t.infoHash} AS torrent " 
  }
  else{
    query+= "WITH s, e " 
  }
  
  if(classes){
    var classes = JSON.parse(he.decode(classes)).split(",");
    if(classes[0] === ['']){
      classes = []
    }
    else{
      for (var i = 0; i < classes.length; i++) {
       classes[i] = he.decode(classes[i].trim()).replace(/['"]+/g, '')
      }  
    }
    console.log(class_all)
    if(class_all === "true"){
      if(count){
        query += "MATCH (c:Class)-[:TAGS]->(s) " +
        "WITH count, s,e,t,c,torrent " +
        "MATCH (c1:Class) WHERE c1.name IN $classes "+ 
        "WITH count, s,e,t,c,torrent, collect(c1) as classes " +
        "WITH count, s,e,t,c,torrent,head(classes) as head, tail(classes) as classes " +
        "MATCH (head)-[:TAGS]->(s) " +
        "WHERE ALL(c1 in classes WHERE (c1)-[:TAGS]->(s)) "
      }
      else{
        query += "MATCH (c:Class)-[:TAGS]->(s) " +
        "WITH s,e,t,c,torrent " +
        "MATCH (c1:Class) WHERE c1.name IN $classes "+ 
        "WITH s,e,t,c,torrent, collect(c1) as classes " +
        "WITH s,e,t,c,torrent,head(classes) as head, tail(classes) as classes " +
        "MATCH (head)-[:TAGS]->(s) " +
        "WHERE ALL(c1 in classes WHERE (c1)-[:TAGS]->(s)) "
      }
    }
    else{
      if(count){
        query += "MATCH (c:Class)-[:TAGS]->(s) " + 
        "WITH count, s,e,t,c,torrent " +
       "MATCH (c1:Class)-[:TAGS]->(s) WHERE c1.name IN $classes "
      }
      else{
        query += "MATCH (c:Class)-[:TAGS]->(s) " + 
        "WITH s " +
        "MATCH (c1:Class)-[:TAGS]->(s) WHERE c1.name IN $classes "
      }
      
    }
    query += "OPTIONAL MATCH (a:Author)-[]->(s) "
    if(count){
      query += "WITH count, s, a, collect(DISTINCT{edition : e, torrent: torrent} ) AS edition_torrents, c "
      query += "MATCH (s:Source) "
      query += "WITH count, s, a, edition_torrents, c ORDER BY s.snatches DESC LIMIT 250 "
    }
    else{
      query += "WITH s LIMIT 250 "
    }
    
    if(count){
      query += "WITH s, count, collect(DISTINCT a) AS authors, edition_torrents, collect(DISTINCT c) as classes ORDER BY s.snatches DESC LIMIT 250 "

    }
    else{
      query += "WITH s LIMIT 250 "

    }
    
    
  }
  else{
    query += "OPTIONAL MATCH (c:Class)-[:TAGS]->(s) " 
    query += "OPTIONAL MATCH (a:Author)-[]->(s) "
    query += "MATCH (s:Source) "
    if(count){
       query += "WITH s, collect(DISTINCT a) AS authors, collect(DISTINCT{edition : e, torrent: torrent} ) AS edition_torrents, collect(DISTINCT c) AS classes, count LIMIT 250 "
    }
    else{
       query += "WITH s LIMIT 250 "
    }
   

  }
  return {query : query, classes : classes}
}

app.post("/top10_adv_search/:time", check("search").trim().escape(), check("format").trim().escape(), check("media").trim().escape(), check("classes").trim().escape(),
  check("publisher").trim().escape(), function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session()
    console.log(req.body.type);
    var top10Query = getTop10Query(req.body.type, req.body.media, req.body.format, req.body.publisher, req.body.classes, req.body.class_all, false);
    var params = {limit : req.body.length, skip : req.body.start, type: req.body.type, media :req.body.media, format :req.body.format, publisher : req.body.publisher, classes: top10Query.classes}

    switch(req.params.time){
      case "top10_day":
        params.time = "P1D";
        break;
      case "top10_week":
        params.time = "P7D";
        break;
      case "top10_month":
        params.time = "P30D";
        break;
      case "top10_year":
        params.time = "P365D";
        break;
    }
    var query = "WITH DATETIME() - duration($time) AS threshold " +
                "MATCH (s:Source)-[]-(e:Edition) " + 
                "WHERE s.top10 > threshold "
    query += top10Query.query;
    query += "WITH count(DISTINCT s) AS count "
    query += "WITH DATETIME() - duration($time) AS threshold, count " +
              "MATCH (s:Source)-[]-(e:Edition) " + 
              "WHERE s.top10 > threshold "
    top10Query = getTop10Query(req.body.type, req.body.media, req.body.format, req.body.publisher, req.body.classes, req.body.class_all, true);
    query += top10Query.query
        query += "RETURN s, authors, edition_torrents, classes, TOFLOAT(count) ORDER BY s.snatches DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "


  session.run(query,params).then(data => {
      session.close();
      var total;
      if(data.records.length > 0){
          total = data.records[0]._fields[4]
          
        }
      console.log("TOTAL : " + total);
      return res.json({recordsTotal : total, recordsFiltered : total, data: data.records});
    })

  })

app.post("/settings_paranoia/:uuid", check("paranoia").trim().escape(), function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session()
    var paranoia;
    if(req.body.paranoia === "true"){
      paranoia = true;
    }
    else{
      paranoia = false;
    }
    var query = "MATCH (u:User {uuid : $uuid}) " +
    "SET u.paranoia = $paranoia"
    var params = {uuid : req.params.uuid, paranoia : paranoia}
    session.run(query,params).then(data=>{
      session.close();
      return res.end();
    })
})

app.post("/user_uploads/:uuid", check("uuid").trim().escape().not().isEmpty(), check('skip').trim().escape(), check("length").trim().escape(),
  function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session()
    var query = 'MATCH (u:User {uuid : $uuid, paranoia : false}) '
    query += "WITH u "
    query += "OPTIONAL MATCH (u)-[:UPLOADED]->(t:Torrent)-[]-(e:Edition)-[]-(s:Source) " 
    query += "WITH count(s) AS count, e, t, u, s "
    query += "OPTIONAL MATCH (cla:Class)-[:TAGS]->(s) "
    query == "WITH count, s, t, u, cla "
    query += "OPTIONAL MATCH (a:Author)-[]->(s) "
    query += "WITH s, cla, count, a, e, {copyrighted : t.copyrighted, payWhatYouWant : t.payWhatYouWant, "
    query += "payment : t.payment, USD_price: t.USD_price, uuid : t.uuid, ETH_address: t.ETH_address, format : t.format ,media: t.media, uploaderUUID : t.uploaderUUID, "
    query +=  "uploaderUser : t.uploaderUser, snatches: t.snatches, created_at : t.created_at, numPeers:  t.numPeers} AS torrent, u.user AS user "
    query += "WITH s, cla, a, collect(DISTINCT {edition: e, torrent: torrent}) AS edition_torrents, count, user "
    switch(req.body.order[0].column){
    case '0':
      query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count, user ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;
    case '1':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count, user  ORDER BY s.title ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count, user  ORDER BY s.title DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      break;
    case '2':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count, user  ORDER BY s.numPeers ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count, user  ORDER BY s.numPeers DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '3':
      console.log("SNATCHES SORT")
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count, user  ORDER BY s.snatches ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count, user  ORDER BY s.snatches DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    case '4':
      if(req.body.order[0].dir === 'asc'){
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count, user  ORDER BY s.updated ASC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "

      }
      else{
        query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count, user  ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      }
      break;
    default :
      query += "RETURN s, collect(DISTINCT a), edition_torrents, collect(DISTINCT cla), count, user  ORDER BY s.updated DESC SKIP TOINTEGER($skip) LIMIT TOINTEGER($limit) "
      break;

  }
    var params = {uuid : he.decode(req.params.uuid), skip: req.body.start, limit: req.body.length};
    session.run(query , params).then(data => {
        session.close()
        var recordsTotal;
        var recordsFiltered;
        if(data.records.length > 0){
          recordsTotal = parseInt(data.records[0]._fields[4]);
          recordsFiltered = parseInt(data.records[0]._fields[4])
        }
        return res.json({recordsTotal: recordsTotal, recordsFiltered: recordsFiltered, data: data.records});
      })
})

app.get("/user_name/:uuid", check("uuid").trim().escape().not().isEmpty(), function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session()
    var query = 'MATCH (u:User {uuid : $uuid, paranoia : false}) '
    query += "RETURN u.user "
    var params = {uuid : req.params.uuid}
    session.run(query,params).then(data=>{
      session.close();
      if(data.records && data.records.length > 0)
        res.json({user : data.records[0]._fields[0]})
    })
})



function canInvite(req, res, next){
  console.log(util.inspect(req.user))

 const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session()
  var query = "MATCH (:User {uuid: $user})-[a:ACCESS]->(:Buoy{uuid:'d2b358ee-b58d-11ed-afa1-0242ac120002'}) " +
  "RETURN a.invites"
  var params = {user : req.user.uuid, buoy : req.body.buoy}
  session.run(query,params).then(data=>{
    session.close();
    if(data.records[0]){
      return next();
    }
    else{
      return res.json({errors : [{msg : "401"}]})
    }  
  })

}

function isAuthenticated(req, res, next) {

    if (req.isAuthenticated()){
        return next();
    }

    console.log("Is not authenciated when should be")
    return res.json({errors : [{msg : "401"}]})
}

function isNotAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    console.log("Is authenticated when should not be")
    return res.json({errors :[{msg : "401"}]});
  }
  next();
}

function buoyPermission(req,res,next){
  if(req.isAuthenticated){
    if(req.user.buoys.includes(req.query.buoy)){
      return next();
    }
    else{
      return res.json({errors :[{msg : "401"}]});

    }
  }
  else{
    if(public_buoys.includes(req.query.buoy)){
      return next();
    }
    else{
      return res.json({errors : [{msg : "401"}]});
    }
  }
}

app.post("/logout", isAuthenticated, function(req,res,next){
  req.logout(function(err){
    if(err) {
      console.log(err);
      return next(err);
    }
    console.log("LOGGED OUT");
    return res.end();
  })
})




app.get("/buoys", function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("ERRORS IN HARBORS")
    return res.json({ errors: errors.array() });
  }

  const session = driver.session();
  var user;
  if(req.user){
    user = req.user.uuid;
  }
  else{
    user = "null";
  }
  var params = {user : user};
  var query = "MATCH (h:Buoy)<-[:ACCESS]-(:User {uuid:$user}) " +
  "RETURN h"

  session.run(query,params).then(data=>{
    session.close();
    return res.json({buoys : data.records})
  })
})

app.get("/home", function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }
  const session = driver.session();
  var query = "OPTIONAL MATCH (h:Buoy {uuid  : 'd2b358ee-b58d-11ed-afa1-0242ac120002'}) " +
  "OPTIONAL MATCH (bu:Bulletin)<-[:HOME]-(h) " +
  "OPTIONAL MATCH (h)<-[a:ACCESS]-(u:User {uuid : $user}) " +
  "WITH h, a, u, bu ORDER BY bu.time DESC " 

  query += "RETURN h, a, u, COLLECT (DISTINCT bu) AS bulletins"
  var user;
  if(!req.user){
    user = "null"
  }
  else{
    console.log("REQ USER"  + req.user.uuid)
    user = req.user.uuid;
  }
  var params = {uuid : req.params.uuid, user : user};
  session.run(query,params).then(data=>{
    session.close();
    console.log(util.inspect(data.records))
    return res.json({buoy : data.records[0]._fields[0] ? data.records[0]._fields[0].properties : null, access: data.records[0]._fields[1] ? 
      data.records[0]._fields[1].properties : null, bulletins :data.records[0]._fields[3],
      source: data.records[0]._fields[4], 
      numAuthors: data.records[0]._fields[10],
      snatches: data.records[0]._fields[6],
      numTorrents: data.records[0]._fields[7],
      numUsers: data.records[0]._fields[8],
      numClasses: data.records[0]._fields[9], 
      source1: data.records[0]._fields[11],
      source2: data.records[0]._fields[12]})
  })
})

function promote(access){
  var rank;
  var rankTitle;
  var invites;
  var description;
  var dmca;
  var promoted;
  var bulletin;
  if(access.rank !== 0){
    if(access.uploads === 25){
      rank = 2;
      rankTitle = "Silver";
      invites = true;
      description = false;
      dmca = false;
      promoted = true;
      bulletin = false;
    }
    else if(access.uploads === 100){
      rank = 3;
      rankTitle = "Gold";
      invites = true;
      description = true;
      dmca = false;
      promoted = true;
      bulletin = true;
    }
    else if(access.uploads === 500){
      rank = 4;
      rankTitle = "Guardian";
      invites = true;
      description = false;
      dmca = true;
      promoted = true;
      bulletin = true;
    }
  }
  if(promoted){
    var session=driver.session();
    var query = "MATCH [a:ACCESS {uuid : $uuid}] " +
    "SET a.rank = $rank, a.rankTitle = $rankTitle, a.invites = $invites, a.bulletin = $bulletin, a.description = $description, a.dmca = $dmca "
    var params = {uuid: access.uuid, rank : rank, rankTitle : rankTitle, invites : inites, bulletin : bulletin, description : description, dmca :dmca}
    session.run(query,params).then(data => {
      session.close();
    })
  }

}

app.get("/snatches", function(req,res){
  var query = "MATCH (s:Source) " +
    "WITH sum(s.snatches) AS snatches " +
    "MATCH (t:Torrent)-[]-(e:Edition)-[]-(s:Source) " +
    "WITH snatches, toFloat(count(t)) AS torrents " +
    "RETURN snatches, torrents"
    var params = {}
    const session = driver.session();
    session.run(query,params).then(data=>{
      session.close();
      return res.json({snatches: data.records[0]._fields[0],  torrents : data.records[0]._fields[1]})
    })
})

app.post("/settings_atlsd/:userUUID", check("atlsd").trim().escape().not().isEmpty(), check("userUUID").trim().escape().not().isEmpty(), function(req,res){
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }
    const session = driver.session();
    var query = "MATCH (u:User { uuid : $userUUID }) " +
    "SET u.atlsd = $atlsd"
    var params = {userUUID :req.params.userUUID, atlsd : req.body.atlsd}
    session.run(query,params).then(data=>{
      session.close();
      return res.end();
    })

})

async function cacheData(req, res, next) {
  let results;
  try {
    const cacheResults = await redisClient.get("torrents");
    console.log(req.body.order[0].column)
    if (cacheResults &&  req.body.start === '0' && (req.body.order[0].column === "0" || (req.body.order[0].column === "4" && req.body.order[0].dir === "desc"))) {
      results = JSON.parse(cacheResults);
      res.json({
        fromCache: true,
        data: results.data,
        recordsTotal : results.recordsTotal,
        recordsFiltered : results.recordsFiltered
      });
      console.log("RETREIVING TORRENTS CACHE!!!")
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(404);
  }

}

async function top10Cache(req, res, next) {
  let results;
  try {
    console.log(req.params.time)
    switch(req.params.time){
      case "top10_day":
        var cacheResults = await redisClient.get("top10_day")
        break;
      case "top10_week":
        var cacheResults = await redisClient.get("top10_week")
        break;
      case "top10_month":
        var cacheResults = await redisClient.get("top10_month")
        break;
      case "top10_year":
        var cacheResults = await redisClient.get("top10_year")
        break;
    }

    if (cacheResults && req.body.start === '0') {
      results = JSON.parse(cacheResults);
      res.json({
        fromCache: true,
        data: results.data,
        recordsTotal : results.recordsTotal,
        recordsFiltered : results.recordsFiltered
      });
      console.log("RETREIVING TOP 10 CACHE")
    } else {
      next();
    }
  } catch (error) {
    console.error(error);
    res.status(404);
  }

}
function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Heroku
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}
app.get('*', function(req, res, next) {

  res.sendFile(path.join(__dirname, '/static/index.html'));

});

app.listen(8080, "0.0.0.0");
console.log('Server started at http://localhost:' + port);