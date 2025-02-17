import { Router } from 'express';
import db from '../db';
import { asyncHandler } from '../express-helpers';
import { isGameModeArray } from '../type-guards';

const anyoneRouter = Router();
export default anyoneRouter;

anyoneRouter.post(
  '/submit',
  asyncHandler(async (req, res) => {
    if (typeof req.body.beatmapsetId !== 'number') {
      return res.status(422).json({ error: 'Invalid beatmapset ID' });
    }

    if (!isGameModeArray(req.body.gameModes)) {
      return res.status(422).json({ error: 'Invalid game modes' });
    }

    if (req.body.gameModes.length === 0) {
      return res.status(422).json({ error: 'No game modes selected' });
    }

    // Checking for exactly null to validate input
    // eslint-disable-next-line eqeqeq
    if (req.body.reason !== null && typeof req.body.reason !== 'string') {
      return res.status(422).json({ error: 'Invalid reason' });
    }

    const beatmapset = await res.typedLocals.osu.createOrRefreshBeatmapset(req.body.beatmapsetId);

    if (beatmapset == null) {
      return res.status(422).json({ error: 'Invalid beatmapset ID' });
    }

    // TODO: This should allow cases where the set is Loved but at least one
    //       difficulty in each requested mode is Pending/WIP/Graveyard
    if (beatmapset.ranked_status > 0) {
      return res.status(422).json({ error: 'Beatmapset is already Ranked/Loved/Qualified' });
    }

    const missingGameModes = new Set(req.body.gameModes);

    for (const gameMode of beatmapset.game_modes) {
      missingGameModes.delete(gameMode);
    }

    if (missingGameModes.size > 0) {
      return res.status(422).json({
        error: `Beatmapset has no beatmaps in game mode ${[...missingGameModes].join(', ')}`,
      });
    }

    const now = new Date();

    try {
      await db.query(
        `
          INSERT INTO submissions
            (beatmapset_id, game_mode, reason, submitted_at, submitter_id)
          VALUES ?
        `,
        [
          req.body.gameModes.map((gameMode) => [
            beatmapset.id,
            gameMode,
            req.body.reason,
            now,
            res.typedLocals.user.id,
          ]),
        ],
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code !== 'ER_DUP_ENTRY') {
        throw error;
      }

      return res.status(422).json({ error: 'You already submitted this map' });
    }

    res.status(204).send();
  }),
);
