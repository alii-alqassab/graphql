export const GET_USER_INFO = `
  query GetUserInfo {
    user {
      id
      attrs
      login
      campus
    }
  }
`;

export const GET_AUDIT_RATIO = `
  query GetAuditRatio {
    user {
      auditRatio
      totalUp
      totalDown
    }
  }
`;

export const GET_XP_AMOUNT = `
  query GetXpAmount {
    transaction_aggregate(
      where: {
        event: { path: { _eq: "/bahrain/bh-module" } }
        type: { _eq: "xp" }
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }
`;

export const GET_USER_LEVEL = `
  query GetUserLevel {
    transaction(
      order_by: { amount: desc }
      limit: 1
      where: { type: { _eq: "level" }, path: { _like: "/bahrain/bh-module%" } }
    ) {
      amount
    }
  }
`;

export const GET_USER_PROJECT_XP = `
  query GetUserProjectXp {
    transaction(
      where: { type: { _eq: "xp" }, object: { type: { _eq: "project" } } }
      order_by: { createdAt: asc }
    ) {
      id
      object {
        name
      }
      amount
      createdAt
    }
  }
`;

export const GET_USER_SKILLS = `
  query GetUserSkills {
    transaction(
      where: { type: { _like: "skill_%" } }
      order_by: { amount: desc }
    ) {
      type
      amount
    }
  }
`;
