// categories
const categories = [
  { id: 1, name: "Tech", category_name: 101 },
  { id: 2, name: "Health", category_name: 102 },
  { id: 3, name: "Education", category_name: 103 },
];

// suggestions
const suggestions = [
  {
    id: 1,
    title: "Improve WiFi",
    desctiption: "WiFi speed in the office needs improvement.",
    is_anonymus: 0,
    created_at: new Date("2025-01-01T10:00:00Z"),
    status: 1,
    user_id: 1,
  },
  {
    id: 2,
    title: "More Plants",
    desctiption: "Add more plants in the lobby.",
    is_anonymus: 1,
    created_at: new Date("2025-02-15T12:30:00Z"),
    status: 0,
    user_id: 2,
  },
];

// suggestions_categories
const suggestions_categories = [
  { id: 1, suggestion_id: 1, category_id: 1 },
  { id: 2, suggestion_id: 2, category_id: 2 },
];

// suggestion_comments
const suggestion_comments = [
  {
    id: 1,
    comment: "Great idea!",
    created_at: new Date("2025-01-02T11:00:00Z"),
    deleted_at: null,
    user_id: 3,
    suggestion_id: 1,
  },
  {
    id: 2,
    comment: "Already in progress.",
    created_at: new Date("2025-02-20T09:15:00Z"),
    deleted_at: null,
    user_id: 1,
    suggestion_id: 2,
  },
];

// suggestion_reactions
const suggestion_reactions = [
  { id: 1, reaction: 1, suggestion_id: 1, user_id: 2 }, // like
  { id: 2, reaction: 0, suggestion_id: 2, user_id: 3 }, // dislike
];

const users = [
  {
    "id": "UUID1",
    "email": "john.doe@tpl.edu.ee",
    "is_active": true,
    "created_at": "2025-01-01T08:00:00",
    "first_name": "John",
    "last_name": "Doe"
  },
  {
    "id": "UUID2",
    "email": "jane.smith@tpl.edu.ee",
    "is_active": true,
    "created_at": "2025-01-05T09:00:00",
    "first_name": "Jane",
    "last_name": "Smith"
  },
  {
    "id": "UUID3",
    "email": "admin.user@tpl.edu.ee",
    "is_active": true,
    "created_at": "2025-01-10T10:00:00",
    "first_name": "Admin",
    "last_name": "User"
  }
]

const scopes = [
  { id: 1, name: "auth:access" },
  { id: 2, name: "user:admin" },
  { id: 3, name: "users:moderate" },
  { id: 4, name: "users:scopes" },
  { id: 5, name: "ideas:read" },
  { id: 6, name: "ideas:create" },
  { id: 7, name: "ideas:update" },
  { id: 8, name: "ideas:moderate" },
  { id: 9, name: "comments:read" },
  { id: 10, name: "comments:create" },
  { id: 11, name: "comments:moderate" },
  { id: 12, name: "voting:read" },
  { id: 13, name: "voting:vote" }
];


const user_scopes = [
  { "userId": "UUID1", "scopeId": 1 },
  { "userId": "UUID2", "scopeId": 1 },
  { "userId": "UUID3", "scopeId": 1 },
  { "userId": "UUID3", "scopeId": 2 },
  { "userId": "UUID3", "scopeId": 6 }
]

const votes = [
  { "id": "UUID4", "ideaId": "1", "userId": "UUID1" },
  { "id": "UUID5", "ideaId": "2", "userId": "UUID2" }
]

const sessions = [
  {
    "id": "UUID6",
    "sid": "UUID7",
    "userId": "UUID1",
    "expires": "2025-06-01T00:00:00",
    "data": "{\"email\":\"john.doe@tpl.edu.ee\"}",
    "createdAt": "2025-01-01T08:00:00",
    "updatedAt": "2025-01-01T08:00:00"
  }
]


module.exports = {
  categories,
  suggestions,
  suggestions_categories,
  suggestion_comments,
  suggestion_reactions,
  users,
  scopes,
  user_scopes,
  votes,
  sessions
};
