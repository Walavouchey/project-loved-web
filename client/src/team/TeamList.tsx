import { defineMessages, useIntl } from 'react-intl';
import type { ResponseError } from 'superagent';
import type { GetTeamResponseBody } from '../api';
import { apiErrorMessage } from '../api';
import { Role } from '../interfaces';
import { gameModeLongName, gameModes } from '../osu-helpers';
import UserList from './UserList';

const messages = defineMessages({
  captains: {
    defaultMessage: '{gameMode} captains',
    description: 'Team listing title',
  },
  developer: {
    defaultMessage: 'Developers',
    description: 'Team listing title',
  },
  metadata: {
    defaultMessage: 'Metadata reviewers',
    description: 'Team listing title',
  },
  moderator: {
    defaultMessage: 'Moderators',
    description: 'Team listing title',
  },
  news: {
    defaultMessage: 'News editors / Managers',
    description: 'Team listing title',
  },
  video: {
    defaultMessage: 'Video editors',
    description: 'Team listing title',
  },
});

interface TeamListProps {
  current: boolean;
  teamApi: readonly [GetTeamResponseBody | undefined, ResponseError | undefined, unknown];
}

export default function TeamList({ current, teamApi }: TeamListProps) {
  const intl = useIntl();
  const [team, teamError] = teamApi;

  if (teamError != null) {
    return <span className='panic'>Failed to load team members: {apiErrorMessage(teamError)}</span>;
  }

  if (team == null) {
    return <span>Loading team members...</span>;
  }

  const teamUsers = current ? team.current : team.alumni;
  const newsUsers = teamUsers[Role.news]?.[-1];
  const metadataUsers = teamUsers[Role.metadata]?.[-1];
  const moderatorUsers = teamUsers[Role.moderator]?.[-1];
  const developerUsers = teamUsers[Role.developer]?.[-1];
  const videoUsers = teamUsers[Role.video]?.[-1];

  return (
    <div className='team-list'>
      {gameModes.map((gameMode) => {
        const captains = teamUsers[Role.captain]?.[gameMode];

        return (
          captains != null && (
            <UserList
              key={gameMode}
              title={intl.formatMessage(messages.captains, {
                gameMode: gameModeLongName(gameMode),
              })}
              users={captains}
            />
          )
        );
      })}
      {newsUsers != null && (
        <UserList title={intl.formatMessage(messages.news)} users={newsUsers} />
      )}
      {metadataUsers != null && (
        <UserList title={intl.formatMessage(messages.metadata)} users={metadataUsers} />
      )}
      {moderatorUsers != null && (
        <UserList title={intl.formatMessage(messages.moderator)} users={moderatorUsers} />
      )}
      {developerUsers != null && (
        <UserList title={intl.formatMessage(messages.developer)} users={developerUsers} />
      )}
      {videoUsers != null && (
        <UserList title={intl.formatMessage(messages.video)} users={videoUsers} />
      )}
    </div>
  );
}
