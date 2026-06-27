import type {
  AdvisoryChatResponse,
  AdvisoryMessage,
  AdvisoryUrgency,
} from '@/types/farm-advisory';

type AdvisoryTopic =
  | 'plantain_black_leaves'
  | 'tomato_disease'
  | 'maize_streak'
  | 'cassava_mosaic'
  | 'pest_general'
  | 'general';

interface ConversationFacts {
  yellowSpotsFirst?: boolean;
  wetSoil?: boolean;
  dryConditions?: boolean;
  spreadingFast?: boolean;
  plantAge?: 'young' | 'mature' | 'unknown';
  wholePlant?: boolean;
  recentRain?: boolean;
  lowerLeavesOnly?: boolean;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function allUserText(messages: AdvisoryMessage[]): string {
  return messages
    .filter((m) => m.role === 'user')
    .map((m) => normalize(m.content))
    .join(' ');
}

function lastUserMessage(messages: AdvisoryMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === 'user');
  return last ? normalize(last.content) : '';
}

function detectTopic(text: string): AdvisoryTopic {
  if (
    (text.includes('plantain') || text.includes('banana')) &&
    (text.includes('black') ||
      text.includes('turning') ||
      text.includes('spot') ||
      text.includes('leaf') ||
      text.includes('leaves'))
  ) {
    return 'plantain_black_leaves';
  }
  if (
    text.includes('tomato') &&
    (text.includes('spot') ||
      text.includes('blight') ||
      text.includes('wilt') ||
      text.includes('leaf') ||
      text.includes('rot'))
  ) {
    return 'tomato_disease';
  }
  if (
    (text.includes('maize') || text.includes('corn')) &&
    (text.includes('streak') ||
      text.includes('yellow') ||
      text.includes('stripe') ||
      text.includes('leaf'))
  ) {
    return 'maize_streak';
  }
  if (
    text.includes('cassava') &&
    (text.includes('mosaic') ||
      text.includes('yellow') ||
      text.includes('curl') ||
      text.includes('leaf'))
  ) {
    return 'cassava_mosaic';
  }
  if (
    text.includes('pest') ||
    text.includes('insect') ||
    text.includes('worm') ||
    text.includes('aphid') ||
    text.includes('borer')
  ) {
    return 'pest_general';
  }
  return 'general';
}

function parseFacts(text: string): ConversationFacts {
  const facts: ConversationFacts = {};

  if (
    text.includes('yellow spot') ||
    text.includes('yellow first') ||
    text.includes('started yellow') ||
    text.includes('yellow before')
  ) {
    facts.yellowSpotsFirst = true;
  }
  if (
    text.includes('no yellow') ||
    text.includes('straight to black') ||
    text.includes('directly black')
  ) {
    facts.yellowSpotsFirst = false;
  }
  if (
    text.includes('wet') ||
    text.includes('waterlog') ||
    text.includes('flooded') ||
    text.includes('soggy') ||
    text.includes('too much water') ||
    text.includes('heavy rain')
  ) {
    facts.wetSoil = true;
    facts.recentRain = true;
  }
  if (
    text.includes('dry') ||
    text.includes('drought') ||
    text.includes('no rain') ||
    text.includes('haven\'t watered')
  ) {
    facts.dryConditions = true;
  }
  if (
    text.includes('spreading') ||
    text.includes('whole field') ||
    text.includes('many plants') ||
    text.includes('getting worse')
  ) {
    facts.spreadingFast = true;
  }
  if (text.includes('young') || text.includes('seedling') || text.includes('new plant')) {
    facts.plantAge = 'young';
  }
  if (text.includes('mature') || text.includes('fruiting') || text.includes('old plant')) {
    facts.plantAge = 'mature';
  }
  if (text.includes('lower leaves') || text.includes('bottom leaves')) {
    facts.lowerLeavesOnly = true;
  }
  if (text.includes('whole leaf') || text.includes('entire leaf')) {
    facts.wholePlant = true;
  }

  return facts;
}

function mergeFacts(messages: AdvisoryMessage[]): ConversationFacts {
  const combined = allUserText(messages);
  return parseFacts(combined);
}

function createAssistantMessage(content: string): AdvisoryMessage {
  return {
    id: `advisory-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role: 'assistant',
    content,
    createdAt: new Date().toISOString(),
  };
}

function respond(
  content: string,
  options?: {
    suggestedFollowUps?: string[];
    urgency?: AdvisoryUrgency;
    topicLabel?: string;
  },
): AdvisoryChatResponse {
  return {
    message: createAssistantMessage(content),
    suggestedFollowUps: options?.suggestedFollowUps,
    urgency: options?.urgency,
    topicLabel: options?.topicLabel,
  };
}

function handlePlantainBlackLeaves(
  messages: AdvisoryMessage[],
  facts: ConversationFacts,
): AdvisoryChatResponse {
  const isFirstTurn = messages.filter((m) => m.role === 'user').length === 1;

  if (isFirstTurn) {
    return respond(
      `Blackening plantain leaves often point to one of these common causes in Ghana:

**1. Black Sigatoka (leaf spot disease)** — usually starts as small yellow streaks, then turns brown/black. Spreads in humid, rainy seasons.
**2. Waterlogging / root stress** — heavy rain or poor drainage can cause leaves to yellow and blacken from the edges.
**3. Nutrient stress (especially potassium)** — older leaves may darken at margins when the plant is under-fed.
**4. Physical or heat damage** — scorching on hot dry days can turn leaf edges black.

To narrow this down, I need a bit more detail:`,
      {
        topicLabel: 'Plantain leaf health',
        urgency: 'medium',
        suggestedFollowUps: [
          'Yellow spots appeared before the leaves turned black',
          'The soil has been very wet after recent rains',
          'It started on lower/older leaves only',
          'It is spreading quickly across many plants',
        ],
      },
    );
  }

  if (facts.yellowSpotsFirst === true || facts.spreadingFast) {
    return respond(
      `Based on what you've described, **Black Sigatoka** is the most likely cause.

**What to do now:**
• Remove and destroy badly affected leaves — do not leave them on the ground.
• Improve airflow: avoid overcrowding, prune excess suckers.
• Keep the base of the plant free of weeds and fallen leaves.
• If available, apply a copper-based or recommended fungicide following label rates (early morning or late evening).
• Plan a regular spray interval during the rainy season if Sigatoka is common in your area.

**Monitor:** If more than a third of leaves are affected or fruit filling is affected, contact your district agricultural extension officer for a field visit.

Would you like guidance on sucker management or a simple spray schedule for the rainy season?`,
      {
        topicLabel: 'Plantain — likely Black Sigatoka',
        urgency: facts.spreadingFast ? 'high' : 'medium',
        suggestedFollowUps: [
          'How do I manage plantain suckers?',
          'What spray schedule should I follow in rainy season?',
        ],
      },
    );
  }

  if (facts.wetSoil || facts.recentRain) {
    return respond(
      `Wet soil after heavy rain is a strong clue. Your plantains may be suffering from **root stress and waterlogging** rather than disease alone.

**Immediate steps:**
• Check drainage — water should not stand around the mat for more than a day.
• If possible, channel excess water away or slightly mound soil around the base.
• Reduce any extra irrigation until the soil dries on the surface.
• Remove fully black leaves to reduce stress on the plant.
• Apply well-composted organic matter when conditions improve — avoid fresh heavy mulch while soil is saturated.

**Watch for:** If leaves continue to blacken after soil dries, Sigatoka may also be present. Look closely for yellow streaks on newer leaves.

Has the water drained now, or is the field still holding water?`,
      {
        topicLabel: 'Plantain — waterlogging stress',
        urgency: 'medium',
        suggestedFollowUps: [
          'The field is still holding water',
          'Water has drained but leaves keep blackening',
        ],
      },
    );
  }

  if (facts.lowerLeavesOnly) {
    return respond(
      `If blackening is mainly on **lower, older leaves**, this can be normal ageing combined with **potassium deficiency** or early Sigatoka on senescing leaves.

**Recommended actions:**
• Remove dead/black lower leaves and clear them from the field.
• Ensure regular application of compost or NPK balanced for plantain (extension services in your district can advise on local blends).
• Mulch to retain moisture without waterlogging.
• Inspect **upper leaves** for yellow streaks — if present, treat for Sigatoka as well.

Are the **younger leaves at the top** still green and healthy?`,
      {
        topicLabel: 'Plantain — lower leaf blackening',
        urgency: 'low',
        suggestedFollowUps: [
          'Top leaves are still healthy',
          'Top leaves also have yellow streaks',
        ],
      },
    );
  }

  if (facts.dryConditions) {
    return respond(
      `Dry conditions can cause **leaf edge scorch** — margins turn brown then black, especially on hot afternoons.

**Try this:**
• Water deeply but less frequently; plantain roots need moisture during dry spells.
• Mulch with dry grass or compost to cool the soil.
• Avoid working the field in peak heat when plants are stressed.

If black patches are in the **centre** of leaves rather than edges, disease is more likely than scorch. Can you describe where on the leaf the black colour appears?`,
      {
        topicLabel: 'Plantain — possible heat/drought stress',
        urgency: 'low',
        suggestedFollowUps: [
          'Black is mainly on leaf edges',
          'Black patches are in the centre of leaves',
        ],
      },
    );
  }

  const last = lastUserMessage(messages);
  if (last.includes('thank') || last.includes('thanks')) {
    return respond(
      `You're welcome. Keep watching your mat over the next week and note whether new leaves stay green. You can return here anytime with photos described in words or new symptoms.`,
      { topicLabel: 'Plantain leaf health', urgency: 'low' },
    );
  }

  return respond(
    `Thanks for the extra detail. To give you safer advice, can you tell me:

1. Did **yellow spots or streaks** appear before the black colour?
2. Has the soil been **very wet** after recent rains?
3. Are **only old lower leaves** affected, or also new leaves at the top?`,
    {
      topicLabel: 'Plantain leaf health',
      urgency: 'medium',
      suggestedFollowUps: [
        'Yellow spots appeared first',
        'Soil has been very wet',
        'Only lower leaves are affected',
        'New top leaves are also turning black',
      ],
    },
  );
}

function handleTomatoDisease(messages: AdvisoryMessage[]): AdvisoryChatResponse {
  const isFirstTurn = messages.filter((m) => m.role === 'user').length === 1;
  const facts = mergeFacts(messages);

  if (isFirstTurn) {
    return respond(
      `Tomato leaf problems in Ghana are often caused by **early blight**, **late blight**, **bacterial spot**, or **nutrient deficiency**.

Common signs:
• **Early blight** — brown rings/target spots on lower leaves first.
• **Late blight** — dark water-soaked patches, spreads fast in cool wet weather.
• **Bacterial spot** — small dark spots with yellow halos.

Tell me more so I can narrow it down:`,
      {
        topicLabel: 'Tomato leaf disease',
        urgency: 'medium',
        suggestedFollowUps: [
          'Brown rings like a target on the leaves',
          'Dark wet patches spreading fast after rain',
          'Small spots with yellow halos',
          'Lower leaves affected first',
        ],
      },
    );
  }

  const text = allUserText(messages);
  if (text.includes('ring') || text.includes('target') || facts.lowerLeavesOnly) {
    return respond(
      `This sounds like **early blight**. Action plan:

• Remove affected lower leaves and destroy them away from the field.
• Avoid overhead watering — water at the base in the morning.
• Rotate tomatoes with non-solanaceous crops next season.
• Maintain spacing for airflow.
• Apply recommended fungicide if damage is spreading (follow extension guidance in your district).

Harvest fruit that is already sizing — blight rarely affects fruit directly at first.`,
      { topicLabel: 'Tomato — early blight', urgency: 'medium' },
    );
  }

  if (text.includes('wet patch') || text.includes('water-soaked') || facts.spreadingFast) {
    return respond(
      `Rapid spread after rain suggests **late blight** — act quickly:

• Remove and destroy infected plants if more than 30% of foliage is affected.
• Do not compost infected material.
• Improve drainage and reduce leaf wetness.
• Contact extension services if the field is large — late blight can wipe out a crop in days.`,
      { topicLabel: 'Tomato — possible late blight', urgency: 'high' },
    );
  }

  return respond(
    `Can you describe the spot shape and whether it started on lower or upper leaves? That helps distinguish blight from bacterial spot.`,
    {
      topicLabel: 'Tomato leaf disease',
      urgency: 'medium',
      suggestedFollowUps: [
        'Brown rings on lower leaves',
        'Dark wet patches after rain',
        'Small spots with yellow halos',
      ],
    },
  );
}

function handleMaizeStreak(messages: AdvisoryMessage[]): AdvisoryChatResponse {
  const isFirstTurn = messages.filter((m) => m.role === 'user').length === 1;

  if (isFirstTurn) {
    return respond(
      `Streaky yellow patterns on maize leaves often indicate **Maize Streak Virus (MSV)**, spread by **leafhoppers**.

Key signs:
• Fine yellow streaks parallel to leaf veins.
• Stunted plants, especially when infected young.
• More common in late-planted or second-season maize.

Was the maize planted late this season, or do you see small green insects on the leaves?`,
      {
        topicLabel: 'Maize streak virus',
        urgency: 'medium',
        suggestedFollowUps: [
          'Maize was planted late this season',
          'Plants look stunted',
          'I see small insects on the leaves',
        ],
      },
    );
  }

  return respond(
    `For MSV management:

• Remove and destroy severely stunted plants to reduce leafhopper feeding sites.
• Plant early with recommended resistant varieties where available.
• Control weeds that host leafhoppers.
• Avoid planting maize back-to-back on the same plot without rotation.

Severe MSV cannot be cured — focus on preventing spread to neighbouring plants.`,
    { topicLabel: 'Maize streak virus', urgency: 'medium' },
  );
}

function handleGeneral(messages: AdvisoryMessage[]): AdvisoryChatResponse {
  const isFirstTurn = messages.filter((m) => m.role === 'user').length === 1;
  const text = allUserText(messages);

  if (isFirstTurn) {
    return respond(
      `I'm your FarmLink farm advisor. Describe what you're seeing — crop, symptoms, and how long it's been happening — and I'll help you work out likely causes and next steps.

For example: "My plantain leaves are turning black" or "Tomatoes have brown spots after the rains."

**Note:** This guidance supports your decisions but does not replace a visit from your district extension officer for serious outbreaks.`,
      {
        topicLabel: 'General farm advice',
        urgency: 'low',
        suggestedFollowUps: [
          'Why are my plantain leaves turning black?',
          'My tomatoes have spots on the leaves',
          'Maize leaves look streaky and yellow',
          'Something is eating my cassava leaves',
        ],
      },
    );
  }

  if (text.includes('cassava')) {
    return respond(
      `For cassava issues, common problems include **cassava mosaic disease**, **bacterial blight**, and **mealybug** damage. Describe leaf colour changes (yellow mosaic, wilting, holes) and whether cuttings were from a known healthy source.`,
      {
        topicLabel: 'Cassava health',
        urgency: 'medium',
        suggestedFollowUps: [
          'Leaves have yellow mosaic patterns',
          'Leaves are wilting and falling',
          'Holes and chewing damage on leaves',
        ],
      },
    );
  }

  return respond(
    `To help further, please share:
• **Which crop** is affected?
• **What symptoms** do you see (colour, spots, wilting, pests)?
• **How long** has it been happening?
• **Recent weather** — heavy rain, drought, or normal?

The more detail you give, the more specific my advice can be.`,
    {
      topicLabel: 'General farm advice',
      urgency: 'low',
      suggestedFollowUps: [
        'Plantain leaves turning black',
        'Tomato leaf spots after rain',
        'Pests on my vegetables',
      ],
    },
  );
}

export function generateFarmAdvisoryResponse(
  messages: AdvisoryMessage[],
): AdvisoryChatResponse {
  if (!messages.some((m) => m.role === 'user')) {
    return respond(
      `Hello! Tell me what's happening on your farm — crop problems, pest signs, or agronomy questions — and I'll help you figure out next steps.`,
      {
        topicLabel: 'Farm advisor',
        urgency: 'low',
        suggestedFollowUps: [
          'Why are my plantain leaves turning black?',
          'My tomatoes have spots on the leaves',
          'How do I prepare land for maize?',
        ],
      },
    );
  }

  const combined = allUserText(messages);
  const topic = detectTopic(combined);
  const facts = mergeFacts(messages);

  switch (topic) {
    case 'plantain_black_leaves':
      return handlePlantainBlackLeaves(messages, facts);
    case 'tomato_disease':
      return handleTomatoDisease(messages);
    case 'maize_streak':
      return handleMaizeStreak(messages);
    case 'cassava_mosaic':
      return respond(
        `Cassava mosaic usually shows **yellow patches** mixed with green on leaves, often with leaf distortion. Use **certified disease-free cuttings** only. Remove and destroy infected plants. Control whiteflies which spread the virus. Do not replant cassava in the same area with shared cuttings from affected fields.`,
        { topicLabel: 'Cassava mosaic disease', urgency: 'high' },
      );
    case 'pest_general':
      return respond(
        `Pest identification works best with details: crop affected, pest colour/size, when you see them (day/night), and damage type (holes, wilting, sticky residue). Common Ghana field pests include fall armyworm (maize), aphids, fruit flies, and stem borers. Describe what you see and I can suggest targeted steps.`,
        {
          topicLabel: 'Pest identification',
          urgency: 'medium',
          suggestedFollowUps: [
            'Holes in maize leaves with caterpillars inside',
            'Sticky leaves with small green insects',
            'Wilting despite watering',
          ],
        },
      );
    default:
      return handleGeneral(messages);
  }
}
