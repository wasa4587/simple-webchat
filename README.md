# simple-webchat


This Reactjs/Nodejs multiple user single channel webchat using vanilla websockets.

### Features
 - single channel
 - miltiple users
 - username is autogenerated
 - typing indicator
 - notify user join|left events.
 - display channel members
 - Users are disconnected when they close the browser tab
 - All components are Higher Order Components


## How to run the server
```
  cd server
  npm i
  npm start
```
you should see somethinig like this in the console


`Fri Oct 19 2018 00:57:37 GMT-0500 (Hora de verano central (México)) Server is listening on port 1337`

## How to run the client
```
  cd webclient
  npm i
  cp config/config.template.js config/config.js
  vi config/config.js # add the ws url i.e.   ws: 'ws://localhost:1337'
  npm start
```

you should see somethinig like this in the console

```
Compiled successfully!

You can now view webclient in the browser.

  Local:            http://localhost:3000/
  On Your Network:  http://192.168.56.1:3000/

Note that the development build is not optimized.
To create a production build, use yarn build.
```

Paste one of the urls in your browser i.e. `http://localhost:3000/`

You should be able to see the chat client

Open a new browser tab to log in as new user

