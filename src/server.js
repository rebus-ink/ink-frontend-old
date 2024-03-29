import express from "express";
import compression from "compression";
import * as sapper from "@sapper/server";
import cookieSession from "cookie-session";
import { setup } from "./auth.js";
import { devServer } from "./dev-server.js";
import cookieParser from 'cookie-parser'
import csurf from "csurf";
// import debugSetup from 'debug'
// const debug = debugSetup('vonnegut:server')

const { NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const app = express();

app.enable("strict routing");
app.disable("x-powered-by");
app.set("trust proxy", true);

app.use(express.urlencoded({ extended: true }));
app.use(
  express.json({
    type: [
      "application/json",
      "application/activity+json",
      "application/ld+json"
    ],
    limit: "100mb"
  })
);
app.use(compression({ threshold: 0 }));
app.use(cookieParser())

app.use(
  cookieSession({
    name: "__session",
    keys: [process.env.COOKIE_KEY],
    secure: !dev,
    signed: false,
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000
  })
);
// Make sure the session doesn't expire as long as there is activity
app.use(function(req, res, next) {
  if (req.session) {
    req.sessionOptions.maxAge = req.session.maxAge || req.sessionOptions.maxAge;
  }
  next();
});
setup(app);
if (dev) {
  devServer(app, sapper);
} else {
  app.use(
    "/",
    (req, res, next) => {
      if (req.path === '/callback') {
        return next()
      } else {
        return csurf()(req, res, next)
      }
    },
    (req, res, next) => {
      res.cookie("XSRF-TOKEN", req.csrfToken());
      next();
    },
    sapper.middleware({
      session: (req, res) => {
        let profile;
        if (req.session && req.session.profile) {
          profile = req.session.profile;
        }
        return {
          user: req.user,
          profile
        };
      }
    })
  );
}

export { sapper, app };

// Need to set this up to actually use https.
