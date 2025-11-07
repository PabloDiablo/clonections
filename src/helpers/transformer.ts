export type GroupV1 = { level: number; members: string[] };
export type GroupsV1 = Record<string, GroupV1>;
export type StartingGroupsV1 = string[][];

export type GameDataV1 = {
  startingGroups: StartingGroupsV1;
  groups: GroupsV1;
};

export type CardV2 = {
  content: string;
  position: number;
};

export type CategoryV2 = {
  title: string;
  cards: CardV2[];
};

export type GameDataV2 = {
  status: string;
  editor: string;
  categories: CategoryV2[];
};

export type GameData = GameDataV1 | GameDataV2;

export const transformV2ToV1 = (data: GameDataV2): GameDataV1 => {
  const groups = data.categories.reduce<GroupsV1>((acc, category, index) => {
    const members = category.cards.map((card) => card.content);
    acc[category.title] = { level: index, members };
    return acc;
  }, {});

  const allCards = data.categories.flatMap((category) => category.cards).sort((a, b) => a.position - b.position);

  const startingGroups = [[], [], [], []];

  allCards.forEach((card, index) => {
    const groupIndex = Math.floor(index / 4);

    startingGroups[groupIndex].push(card.content);
  });

  return {
    groups,
    startingGroups,
  };
};
