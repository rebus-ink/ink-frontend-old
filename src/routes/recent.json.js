import got from "got";
import { normalise } from "../api/normalise-publication.js";
export async function get(req, res, next) {
  if (req.user && req.session.profile && req.session.profile.id) {
    try {
      const response = await got(`${req.session.profile.id}/library?limit=10`, {
        headers: {
          Authorization: `Bearer ${req.user.token}`
        },
        json: true
      });
      response.body.items = response.body.items.map(normalise);
      return res.json(response.body);
    } catch (err) {
      res.status(500);
      console.error("in recent: ", err);
      res.json(err);
    }
  } else {
    res.sendStatus(404);
  }
}
