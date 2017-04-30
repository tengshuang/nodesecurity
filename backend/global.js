
module.exports = {
	'Cities':{
	  "Cities":[
	  {
	    "name": "Mountain View",
	    "lat": 37.3812126,
	    "lon": -122.093028
	  },
	  {
	    "name": "Sunnyvale",
	    "lat": 37.3897202,
	    "lon": -122.0941618
	  },
	  {
	    "name": "Santa Clara",
	    "lat": 37.3710062,
	    "lon": -122.0375934
	  },
	  {
	    "name": "San Jose",
	    "lat": 37.3529962,
	    "lon": -121.9816318
	  },
	  {
	    "name": "Palo Alto",
	    "lat": 37.4257657,
	    "lon": -122.2053909
	  },
	  {
	    "name": "San Francisco",
	    "lat": 37.7048666,
	    "lon": -122.4475594
	  },
	  {
	    "name": "Daly City",
	    "lat": 37.6799413,
	    "lon": -122.4819846
	  },
	  {
	    "name": "South San Francisco",
	    "lat": 37.6373389,
	    "lon": -122.4291667
	  },
	  {
	    "name": "Menlo Park",
	    "lat": 37.4630463,
	    "lon": -122.2449102
	  }
	  ]
	},
	'Default': {
		DB_URL: 'mongodb://localhost:27017/ESN',
		DB_USERNAME: 'DB_USERNAME',
		DB_PASSWORD: 'DB_PASSWORD',
		SERVER_PORT: 3000
	},
	'Test': {
		DB_URL: 'mongodb://localhost:27017/Test',
		DB_USERNAME: 'DB_USERNAME_TEST',
		DB_PASSWORD: 'DB_PASSWORD_TEST',
		SERVER_PORT: 3000
	},
	'Heroku': {
		DB_URL: 'mongodb://root:root@ds059145.mlab.com:59145/fseesnsv6',
		DB_USERNAME: 'root',
		DB_PASSWORD: 'root',
		SERVER_PORT: 59145
	},
    success:200,
    unauthorized:401,
    notfound:404,
	forbidden:403,
	dbError:500,
	publicDirName:'public',
	announcementDirName:'announcement'
};
