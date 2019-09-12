import * as fs from "fs";
import { parseToC } from "../../api/toc-to-json.js";
import got from "got";

export async function get(req, res, next) {
  if (req.user) {
    // Should use getter to always fetch, no url wrangling
    const file = req.query.toc;
    const url = new URL(file, process.env.API_SERVER);
    const redirect = await got.head(url.href, {
      followRedirect: false,
      headers: {
        Authorization: `Bearer ${req.user.token}`
      }
    });
    let body
    if (redirect.headers.location && redirect.statusCode === 302) {
      const response = await got.get(redirect.headers.location, {
        headers: {
          Authorization: `Bearer ${req.user.token}`
        },
        json: false
      });
      body = await response.body;
    } else {
      res.sendStatus(404)
    }
    try {
      const toc = parseToC(
        body,
        url.hostname === "example.com" ? url.pathname : file
      );
      await fs.promises.writeFile(
        "childrens-literature.json",
        JSON.stringify(toc, null, 2)
      );
      await fs.promises.writeFile(
        "childrens-literature.html",
        body
      );
      return res.json(toc);
    } catch (err) {
      next(err);
    }
  } else {
    return res.sendStatus(403);
  }
}
