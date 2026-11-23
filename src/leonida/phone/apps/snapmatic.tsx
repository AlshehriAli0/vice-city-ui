import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { ChevronRight, Eye, House, Heart, MessageSquare, Play } from "lucide-react";

import { cssVariables } from "../../../shared/css-variables";
import { CONTACTS, usePhone } from "../phone-data";
import { PhoneMenu, PhoneMenuItem } from "../phone-menu";
import { App, AppHeader, AppMenu, Face, Scroll } from "./app-layout";

type Post = { id: string; handle: string; likes: number; comments: number; video?: boolean; tone: string };

const POSTS: Post[] = [
  { id: "p1", handle: "@handle_one", likes: 403, comments: 4, tone: "linear-gradient(160deg,#c98a5e,#5a4a6e)" },
  {
    id: "p2",
    handle: "@handle_two",
    likes: 1280,
    comments: 37,
    video: true,
    tone: "linear-gradient(160deg,#d6456e,#3a2350)",
  },
  { id: "p3", handle: "@handle_three", likes: 96, comments: 2, tone: "linear-gradient(160deg,#5fb2c9,#2c4f7a)" },
];

const TABS = [
  { value: "home", label: "Home", icon: House },
  { value: "explore", label: "Explore", icon: Eye },
  { value: "liked", label: "Liked", icon: Heart },
];

const PostCard = ({ post }: { post: Post }) => (
  <PhoneMenuItem value={post.id} className="ld-snap__post" aria-label={`Post by ${post.handle}`}>
    <span className="ld-snap__media ld-pic" style={cssVariables({ "--media": post.tone })}>
      {post.video && (
        <i className="ld-snap__play" aria-hidden="true">
          <Play fill="currentColor" />
        </i>
      )}
    </span>
    <span className="ld-snap__meta">
      <b className="ld-snap__handle">
        <i className="ld-snap__dot" aria-hidden="true" />
        {post.handle}
      </b>
      <small>Caption placeholder that runs on past the end of the line</small>
      <em className="ld-snap__counts">
        <Heart aria-hidden="true" /> {post.likes}
        <MessageSquare aria-hidden="true" /> {post.comments}
      </em>
    </span>
  </PhoneMenuItem>
);

const OPTIONS = [
  { id: "like", group: "Post", label: "Like" },
  { id: "comments", group: "View", label: "Comments" },
  { id: "profile", group: "View", label: "Profile" },
];

const Snapmatic = () => {
  const { entry, update, go } = usePhone();
  const tab = entry.param ?? "explore";
  const post = POSTS.find(item => item.id === entry.focus) ?? POSTS[0];
  return (
    <App screen="snapmatic">
      <Tabs className="ld-snap" value={tab} onValueChange={value => value && update({ param: value, focus: null })}>
        {TABS.map(({ value }) => (
          <TabsPanel key={value} value={value} className="ld-snap__panel">
            {value === "liked" ? (
              <div className="ld-snap__empty">
                <Heart aria-hidden="true" />
                <p>Like posts to see them here.</p>
              </div>
            ) : (
              <Scroll>
                <AppMenu
                  label={value === "home" ? "Home feed" : "Explore feed"}
                  onOpen={id => go({ screen: "comments", param: id })}
                >
                  {(value === "home" ? [...POSTS].reverse() : POSTS).map(item => (
                    <PostCard key={item.id} post={item} />
                  ))}
                </AppMenu>
                <p className="ld-snap__end">All Caught Up!</p>
              </Scroll>
            )}
          </TabsPanel>
        ))}
        <TabsList className="ld-snap__tabs" aria-label="Snapmatic tabs">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTab key={value} value={value} className="ld-snap__tab" aria-label={label}>
              <Icon aria-hidden="true" />
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
      {entry.sheet && (
        <div className="ld-snap__sheet" data-slot="phone-sheet">
          <PhoneMenu
            aria-label="Post options"
            defaultValue="like"
            onOpen={id => {
              if (id === "like") update({ sheet: undefined });
              else
                go({
                  screen: id === "comments" ? "comments" : "profile",
                  param: id === "comments" ? post.id : post.handle,
                });
            }}
          >
            {OPTIONS.map((option, index) => (
              <div key={option.id} className="ld-snap__group">
                {OPTIONS[index - 1]?.group !== option.group && <h3>{option.group}</h3>}
                <PhoneMenuItem value={option.id} className="ld-snap__option">
                  {option.id === "like" && (
                    <i className="ld-snap__like" aria-hidden="true">
                      <Heart />
                    </i>
                  )}
                  <span>{option.label}</span>
                  {option.group === "View" && <ChevronRight className="ld-snap__chev" aria-hidden="true" />}
                </PhoneMenuItem>
              </div>
            ))}
          </PhoneMenu>
        </div>
      )}
    </App>
  );
};

const Comments = () => (
  <App screen="comments">
    <AppHeader title="Comments" />
    <Scroll>
      {["@handle_four", "@handle_five", "@handle_six"].map(handle => (
        <div key={handle} className="ld-app__card ld-snap__comment">
          <b>{handle}</b>
          <p>Comment placeholder text.</p>
        </div>
      ))}
    </Scroll>
  </App>
);

const Profile = () => {
  const { entry } = usePhone();
  const contact = CONTACTS.find(item => item.id === entry.param);
  const handle = contact ? `@${contact.id}` : (entry.param ?? "@handle");
  return (
    <App screen="profile">
      <AppHeader title={handle} />
      <Scroll>
        <div className="ld-snap__profile">
          <span className="ld-snap__ring">
            <Face contact={contact ?? { name: handle.slice(1), tone: "#8a7fd0" }} size="lg" />
          </span>
          <span className="ld-snap__stats">
            <b>120</b>
            <small>Followers</small>
          </span>
          <span className="ld-snap__stats">
            <b>80</b>
            <small>Following</small>
          </span>
        </div>
        <AppMenu label="Profile">
          <PhoneMenuItem value="bio" className="ld-app__card ld-snap__bio" aria-label="View bio">
            <small>Bio placeholder</small>
            <ChevronRight aria-hidden="true" />
          </PhoneMenuItem>
        </AppMenu>
      </Scroll>
    </App>
  );
};

export { Snapmatic, Comments, Profile };
