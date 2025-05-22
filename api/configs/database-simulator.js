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

module.exports = {
  categories,
  suggestions,
  suggestions_categories,
  suggestion_comments,
  suggestion_reactions,
};