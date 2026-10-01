import type { WasteDef } from '../types/game';

// 流れてくるゴミの一覧と分解ルール。
// isSimple=false のものはタップで複数パーツに分解してから分別する。
// 行を追加・編集するだけでゴミの種類を増やせる。
export const Waste: WasteDef[] = [
  { //飲み残しあり，キャップ，ラベル付きペットボトル
    key: 'pet_label_cap_drink', //key
    label: 'ペットボトル', //ごみ名
    img: 'ここに挿入', //アイコン画像
    score: 50, //獲得点数
    isSimple: false, //分解できるか
    isWash: true, //洗える・流せるか
    isBurn: false, //発火の危険性があるか
    bin: "yet", //ごみ箱・分解可能ならそちらを優先して処理
    parts: ['pet', 'label', 'cap'],
    feedBackId: 'forget_separate',
    wasteLevel: 3,
  },
  { //飲み残しあり，キャップ付きペットボトル
    key: 'pet_cap_drink', //key
    label: 'ペットボトル', //ごみ名
    img: 'ごみデータ/ペットボトル_ラベル無.png', //アイコン画像
    score: 40, //獲得点数
    isSimple: false, //分解できるか
    isWash: true, //洗える・流せるか
    isBurn: false, //発火の危険性があるか
    bin: "yet", //ごみ箱・分解可能ならそちらを優先して処理
    parts: ['pet', 'cap'],
    feedBackId: 'forget_separate',
    wasteLevel: 3,
  },
  { //飲み残しあり，ラベル付きペットボトル
    key: 'pet_label_drink', //key
    label: 'ペットボトル', //ごみ名
    img: 'ごみデータ/ペットボトル_キャップ無.png', //アイコン画像
    score: 30, //獲得点数
    isSimple: false, //分解できるか
    isWash: true, //洗える・流せるか
    isBurn: false, //発火の危険性があるか
    bin: "yet", //ごみ箱・分解可能ならそちらを優先して処理
    parts: ['pet', 'label'],
    feedBackId: 'forget_separate',
    wasteLevel: 2,
  },
  { //飲み残しあり，ペットボトル
    key: 'pet_drink', //key
    label: 'ペットボトル', //ごみ名
    img: 'ごみデータ/ペットボトル_キャップ無_ラベル無.png', //アイコン画像
    score: 20, //獲得点数
    isSimple: false, //分解できるか
    isWash: true, //洗える・流せるか
    isBurn: false, //発火の危険性があるか
    bin: "yet", //ごみ箱・分解可能ならそちらを優先して処理
    parts: ["pet"],
    feedBackId: 'must_flush',
    wasteLevel: 2,
  },
  { //ペットボトル
    key: 'pet', //key
    label: 'ボトル', //ごみ名
    img: 'ごみデータ/ペットボトル_ラベル無_キャップ無_飲み残し無.png', //アイコン画像
    score: 10, //獲得点数
    isSimple: true, //分解できるか
    isWash: true, //洗える・流せるか
    isBurn: false, //発火の危険性があるか
    bin: "pet", //ごみ箱・分解可能ならそちらを優先して処理
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { //キャップ
    key: 'cap', //key
    label: 'ごみデータ/キャップ.png', //ごみ名
    img: 'ここに挿入', //アイコン画像
    score: 10, //獲得点数
    isSimple: true, //分解できるか
    isWash: false, //洗える・流せるか
    isBurn: false, //発火の危険性があるか
    bin: "recycle_plastic", //ごみ箱・分解可能ならそちらを優先して処理
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { //ラベル
    key: 'label', //key
    label: 'ラベル', //ごみ名
    img: 'ごみデータ/ラベル.png', //アイコン画像
    score: 10, //獲得点数
    isSimple: true, //分解できるか
    isWash: false, //洗える・流せるか
    isBurn: false, //発火の危険性があるか
    bin: "recycle_plastic", //ごみ箱・分解可能ならそちらを優先して処理
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // ぬいぐるみ（電子機器なし・30cm未満はその他プラ）
    key: 'nuigurumi',
    label: 'ぬいぐるみ(電子機器無し)',
    img: 'ごみデータ/ぬいぐるみ.png',
    score: 20,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'other_plastic',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // ボールペン（プラスチック製文房具はその他プラ）
    key: 'ballpoint_pen',
    label: 'ボールペン',
    img: 'ごみデータ/ボールペン.png',
    score: 10,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'other_plastic',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // モバイル充電器（リチウムイオン電池内蔵のため有害ごみ、発火の危険あり）
    key: 'mobile_battery',
    label: 'モバイル充電器',
    img: 'ごみデータ/モバイル充電器.png',
    score: 30,
    isSimple: true,
    isWash: false,
    isBurn: true,
    bin: 'yugai',
    parts: [],
    feedBackId: 'burning',
    wasteLevel: 3,
  },
  { // 卵のパック（パルプモールド・紙製容器は可燃ごみ）
    key: 'egg_carton_pulp',
    label: '卵のパック（パルプモールド）',
    img: 'ごみデータ/卵のパック（パルプモールド）.png',
    score: 20,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'kanen',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // 歯ブラシ（手動のプラスチック製歯ブラシはその他プラ）
    key: 'toothbrush',
    label: '歯ブラシ',
    img: 'ごみデータ/歯ブラシ.png',
    score: 10,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'other_plastic',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // 発泡スチロール（商品保護・緩衝材・容器包装はリサイクルプラ）
    key: 'styrofoam',
    label: '発泡スチロール',
    img: 'ごみデータ/発泡スチロール.png',
    score: 20,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'recycle_plastic',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // 輪ゴム（ゴム製品はその他プラ）
    key: 'rubber_band',
    label: '輪ゴム',
    img: 'ごみデータ/輪ゴム.png',
    score: 10,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'other_plastic',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // 靴（スニーカー・革靴などはその他プラ）
    key: 'shoes',
    label: '靴（運動靴・革靴・スリッパ・サンダル等）',
    img: 'ごみデータ/靴.png',
    score: 20,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'other_plastic',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  // ─── 可燃ごみ（燃やすごみ） ──────────────────────────────────
  { // えんぴつ（木製・文房具は可燃ごみ）
    key: 'pencil',
    label: '鉛筆',
    img: 'ごみデータ/えんぴつ.png',
    score: 10,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'kanen',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // 割りばし（木製品は可燃ごみ）
    key: 'disposable_chopsticks',
    label: '割り箸',
    img: 'ごみデータ/割りばし.png',
    score: 10,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'kanen',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // 草（植物・刈り草は可燃ごみ）
    key: 'grass',
    label: '草(花殻)',
    img: 'ごみデータ/草.png',
    score: 10,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'kanen',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // ヨーグルト容器（汚れあり・水洗いでリサイクルプラへ）
    key: 'yogurt_dirty',
    label: 'ヨーグルトのカップ プラスチック製（汚れあり）',
    img: 'ごみデータ/ヨーグルト（汚れあり）.png',
    score: 15,
    isSimple: true,
    isWash: true,
    isBurn: false,
    bin: 'yet',
    parts: [],
    feedBackId: 'must_wash',
    wasteLevel: 2,
    washTargetKey: 'yogurt_clean',
  },
  // ─── 資源ごみ（紙類・空きびん） ──────────────────────────────
  { // はがき（紙類・雑がみは資源ごみ）
    key: 'postcard',
    label: 'はがき',
    img: 'ごみデータ/はがき.png',
    score: 10,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'sigen',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // ビール瓶（飲料用ガラス瓶は資源ごみ）
    key: 'beer_bottle',
    label: 'ビールびん',
    img: 'ごみデータ/ビール瓶(※)不適と思ったらラムネ瓶を採用してね.png',
    score: 15,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'sigen',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // ラムネ瓶（飲料用ガラス瓶は資源ごみ）
    key: 'ramune_bottle',
    label: 'びん(ガラス) 薬・飲料・食料品等用',
    img: 'ごみデータ/ラムネ瓶(※).png',
    score: 15,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'sigen',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // しょうゆ瓶（調味料ガラス瓶・洗浄済は資源ごみ）
    key: 'soy_sauce_bottle',
    label: 'しょうゆの容器 ペットボトル（洗浄済）',
    img: 'ごみデータ/しょうゆ.png',
    score: 15,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'pet',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // みりん瓶（調味料ガラス瓶・洗浄済は資源ごみ）
    key: 'mirin_bottle',
    label: 'みりんの容器 ペットボトル（洗浄済）',
    img: 'ごみデータ/みりん.png',
    score: 15,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'pet',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // 料理酒瓶（調味料ガラス瓶・洗浄済は資源ごみ）
    key: 'cooking_sake_bottle',
    label: '酒の容器 ペットボトル（洗浄済）',
    img: 'ごみデータ/料理酒.png',
    score: 15,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'pet',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  // ─── 汚れのあるびん（水洗いで資源ごみへ） ──────────────────────
  { // しょうゆ瓶（水洗いで資源ごみへ）
    key: 'soy_sauce_dirty',
    label: 'しょうゆの容器 ペットボトル（汚れあり）',
    img: 'ごみデータ/しょうゆ（汚れあり）.png',
    score: 20,
    isSimple: true,
    isWash: true,
    isBurn: false,
    bin: 'yet',
    parts: [],
    feedBackId: 'must_wash',
    wasteLevel: 2,
    washTargetKey: 'soy_sauce_bottle',
  },
  { // みりん瓶（水洗いで資源ごみへ）
    key: 'mirin_dirty',
    label: 'みりんの容器 ペットボトル（汚れあり）',
    img: 'ごみデータ/みりん（汚れあり）.png',
    score: 20,
    isSimple: true,
    isWash: true,
    isBurn: false,
    bin: 'yet',
    parts: [],
    feedBackId: 'must_wash',
    wasteLevel: 2,
    washTargetKey: 'mirin_bottle',
  },
  { // 料理酒瓶（水洗いで資源ごみへ）
    key: 'cooking_sake_dirty',
    label: '酒の容器 ペットボトル（汚れあり）',
    img: 'ごみデータ/料理酒（汚れあり）.png',
    score: 20,
    isSimple: true,
    isWash: true,
    isBurn: false,
    bin: 'yet',
    parts: [],
    feedBackId: 'must_wash',
    wasteLevel: 2,
    washTargetKey: 'cooking_sake_bottle',
  },
  // ─── リサイクルプラ（プラスチック製容器包装） ────────────────
  { // コンビニ弁当容器（プラマーク・容器包装はリサイクルプラ）
    key: 'bento_box',
    label: '弁当ガラ(プラスチック製容器)',
    img: 'ごみデータ/コンビニ弁当.png',
    score: 15,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'recycle_plastic',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  { // ヨーグルトカップ（洗浄済・容器包装はリサイクルプラ）
    key: 'yogurt_clean',
    label: 'ヨーグルトのカップ プラスチック製（洗浄済）',
    img: 'ごみデータ/ヨーグルト.png',
    score: 15,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'recycle_plastic',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 1,
  },
  // ─── 大型ごみ（最長辺30cm以上） ─────────────────────────────
  { // 布団（最長辺30cm以上の寝具は大型ごみ）
    key: 'futon',
    label: 'ふとん',
    img: 'ごみデータ/ふとん.png',
    score: 20,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'oogata',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 2,
  },
  { // 学習机（最長辺30cm以上の家具は大型ごみ）
    key: 'study_desk',
    label: '学習机',
    img: 'ごみデータ/学習机.png',
    score: 25,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'oogata',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 2,
  },
  { // オーブンレンジ（最長辺30cm以上の家電は大型ごみ）
    key: 'microwave_oven',
    label: 'オーブンレンジ',
    img: 'ごみデータ/オーブンレンジ.png',
    score: 25,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'oogata',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 2,
  },
  { // アイロン台（最長辺30cm以上の生活用品は大型ごみ）
    key: 'ironing_board',
    label: 'アイロン台',
    img: 'ごみデータ/アイロン台リアル.png',
    score: 20,
    isSimple: true,
    isWash: false,
    isBurn: false,
    bin: 'oogata',
    parts: [],
    feedBackId: 'simple_mistake',
    wasteLevel: 2,
  },
];