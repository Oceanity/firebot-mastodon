import { EventSource } from "@crowbartools/firebot-types";
import * as packageJson from "../package.json";
import { MastodonEvent } from "./types";

export const {
  displayName: MASTODON_PLUGIN_NAME,
  description: MASTODON_PLUGIN_DESCRIPTION,
  author: MASTODON_PLUGIN_AUTHOR,
  version: MASTODON_PLUGIN_VERSION,
} = packageJson;

export const MASTODON_PLUGIN_NAME_AND_AUTHOR = `${MASTODON_PLUGIN_NAME} (by ${MASTODON_PLUGIN_AUTHOR})`;
export const MASTODON_PLUGIN_ID = "oceanity:mastodon";
export const MASTODON_PLUGIN_FIREBOT_VERSION = "5";
export const MASTODON_POST_VARIABLE_PREFIX = "mastodonPost";
export const MASTODON_STATUS_VARIABLE_PREFIX = "mastodonStatus";
export const MASTODON_USER_VARIABLE_PREFIX = "mastodonUser";
export const MASTODON_DELETE_VARIABLE = "mastodonDeletedStatusId";
export const MASTODON_POST_AUTHOR_VARIABLE_PREFIX = `${MASTODON_POST_VARIABLE_PREFIX}Author`;
export const MASTODON_STATUS_AUTHOR_VARIABLE_PREFIX = `${MASTODON_STATUS_VARIABLE_PREFIX}Author`;

export const MASTODON_EVENT_SOURCE: EventSource = {
  id: MASTODON_PLUGIN_ID,
  name: "Mastodon",
  events: [
    {
      id: MastodonEvent.Follow,
      name: "Follow",
      description: "When someone follows you on Mastodon",
    },
    {
      id: MastodonEvent.Like,
      name: "Like",
      description: "When someone likes one of your posts on Mastodon",
    },
    {
      id: MastodonEvent.Reply,
      name: "Reply",
      description: "When someone replies to one of your posts on Mastodon",
    },
    {
      id: MastodonEvent.Boost,
      name: "Boost",
      description: "When someone boosts one of your posts on Mastodon",
    },
    {
      id: MastodonEvent.Mention,
      name: "Mention",
      description: "When someone mentions you on Mastodon",
    },
    {
      id: MastodonEvent.NewStatus,
      name: "New Status Posted",
      description: "When a new status is posted to the local timeline",
    },
    {
      id: MastodonEvent.Delete,
      name: "Status Deleted",
      description: "When a status is deleted from the local timeline",
    },
  ],
};

export const MASTODON_PLUGIN_ICON_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAapQTFRFAAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////3hTzAgAAAI50Uk5TAA5lpMbd6/T6/f/+/Pjx6NzLtIsyC5bIK+D5YB/pTMPtEUXlazgxTrNJMDt17milwBBxWhjUvM/3GbWVJZMmgW8MHRQSdn239VMBAtp8P1VAXjxjQlv7ZEFi8Ozk49/b1dfRu8V/uaPHxDaeeB5G0CINWAbWPjpdmqmtq6KEbA+K0gckGrG9N94JaTnM6ooOeLAAAAH7SURBVHicfZJrSFRRFIXX0v5UWEJO+IooYkCYEjNQRBRCVLKXTSFTShGJgiIaar98FJEkBEEwRA8lqZDMsJf2QEUkpEIyRQhsEkRLfJQaEoJi+9w70p3m3tk/7lr3rI/N2YdNaEWTmtET9bFxPhh+FbIy4wXCOe8fS4VyQgOiOWuaA6u2MQVsn7bIga0cJXZOaj5Cu9iYuCW7ch7tdNcgETuinJ2flOz9gph+ZfZxWInjA5EwJGYP+/SmSXynm+Rvc6qvh9imrhjfC6RI4+797EwjfwueIUdIeUUZV0xqB+KWPQiJb0cWuxCxMI1DnWqOP8QG1TDtGY68Fd00iaNvRKNGkP1aPdMisV69VeYTODtE09sQ9Uv0wGOceCl68BGROKgDOc9FDzfD9dQArCwRJ9sCANkPvFNYAcfuE3mtAYDjTcTpFgOwOQO9PwxATiNxttkArNUa4LpLnHsYADh1m0gaEJNLsMkAuNYh6J7oGTdR1Gi5DnCEtRPFDZb5csEN2aiSO1Z5Pq+rnSy7SbOUYU5eg7a05W79qIj8uUVt260Cftxhu+gFgdp63Wa1mHYCahr0tb/AanMAMbtfaN7urNIPL393+wA47w7SflYdnsKN/No1VXrFF0AdL/n09QNwlUOt/3JbccX/gMzwvnIhdCDuc090ZN+4odlfkdigIcKl2rAAAAAASUVORK5CYII=";
