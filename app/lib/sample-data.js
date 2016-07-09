// Sample print data for Financial Professional print views
function samplePrintData() {
  var company = {
    name: 'XYZ Advisory Group',
    copy: 'Jack Smith provides highly personalized financial planning and investment management guidance to business owners and their families. Jack has a degree in finance from Ivy College and an MBA from Anywhere University. He has been a financial advisor since 1994, and his perspectives are regularly cited in the national financial news media.',
    phone: '808-555-1234',
    email: 'john@email.com',
    address_1: '100 Main Street Suite #123',
    address_city: 'Honolulu',
    address_state: 'HI',
    address_zip: 96822
  };

  var whiteLabel = {
    url: 'xyzadvisorygroup.com',
    name: 'XYZ Advisory Group',
    logo: 'https://nestegg-staging.s3.amazonaws.com/hello-logo.png',
    site: 'xyzadvisorygroup.com'
  };

  var savingsInputs = {
    years: '25',
    current: '100000',
    salary: '50000',
    contributionOption: '10',
    dollarContribution: '12500',
    percentageContribution: '10',
    increase: '3',
    stocks: '80',
    bonds: '20',
    cash: '0',
    lgEquities: '45',
    smEquities: '30',
    iEquities: '25',
    cdRate: '2',
    moneyRate: '0',
    investment: '1',
    investmentStrategy: '1',
    targetStocks: '50',
    bondSelect: '3',
    cashSelect: '2'
  };

  var savingsResults = {
    "accumtable": {
      "80thPercentileBalance": "1323356",
      "60thPercentileBalance": "1073647",
      "MedianBalance": "983874",
      "40thPercentileBalance": "900769",
      "20thPercentileBalance": "745384",
      "10ValueatRisk": "638243",
      "5ValueatRisk": "566556",
      "1ValueatRisk": "452604",
      "LowestBalance": "349043"
    },
    "keytable": {
      "MeanBalance": "1054260",
      "HighestBalance": "3280254",
      "NumberofYearsuntilRetirement": "25",
      "AverageAnnualRetirementContribution": "7292",
      "TotalContributionsatRetirement": "182296",
      "BestCaseMaximumAccumulatedBalance": "3280254",
      "WorstCaseMinimumAccumulatedBalance": "349043",
      "10ValueatRisk": "638243",
      "5ValueatRisk": "566556",
      "1ValueatRisk": "452604",
      "increase": "3",
      "initial": "10%"
    }
  };

  var spendingInputs = {
    years: '30',
    current: '1000000',
    expenses: '45000',
    living: '3',
    withdrawalOption: '1',
    firstWithdrawalStart: '10',
    firstWithdrawalStartDelta: 'true',
    firstWithdrawalAmount: '0',
    firstWithdrawalEnd: '20',
    secondWithdrawalStart: '20',
    secondWithdrawalStartDelta: 'true',
    secondWithdrawalAmount: '0',
    stocks: '60',
    bonds: '30',
    cash: '10',
    lgEquities: '45',
    smEquities: '30',
    iEquities: '25',
    cdRate: '2',
    moneyRate: '0',
    investment: '1',
    withdrawalStrategy: '1',
    bondSelect: '3',
    cashSelect: '2'
  };

  var spendingResults = {
    "rbtable": {
      "LowestBalance": ["$575960", "$245545", "$0", "$0", "$0", "$0"],
      "1ValueatRisk": ["$700787", "$516570", "$269114", "$0", "$0", "$0"],
      "5ValueatRisk": ["$782667", "$628650", "$418722", "$103619", "$0", "$0"],
      "10ValueatRisk": ["$828518", "$702171", "$513967", "$219344", "$0", "$0"],
      "20thPercentileBalance": ["$891534", "$798366", "$637609", "$390736", "$0", "$0"],
      "40thPercentileBalance": ["$982943", "$937964", "$833534", "$645195", "$335680", "$0"],
      "MedianBalance": ["$1024431", "$1005499", "$925968", "$763857", "$482416", "$38490"],
      "60thPercentileBalance": ["$1065908", "$1069124", "$1027049", "$890220", "$659515", "$265548"],
      "80thPercentileBalance": ["$1171456", "$1251279", "$1285405", "$1264090", "$1150991", "$889083"]
    },
    "keytable": {
      "NumberofYearsinRetirementHorizon": "30",
      "ProbabilityofSuccessinHorizonPeriod": "52",
      "MaximumRemainingBalance": "8915085",
      "PercentageofTimeSavingsFailed": "48",
      "WorstCaseSavingsDepletedinYears": "14",
      "BestCaseSavingsDepletedinYears": "50",
      "80thPercentileSavingsDepletedinYears": "50",
      "60thPercentileSavingsDepletedinYears": "50",
      "MeanSavingsDepletedinYears": "38",
      "MedianSavingsDepletedinYears": "50",
      "40thPercentileSavingsDepletedinYears": "29",
      "20thPercentileSavingsDepletedinYears": "25",
      "10ValueatRiskSavingsDepletedinYears": "23",
      "5ValueatRiskSavingsDepletedinYears": "21",
      "1ValueatRiskSavingsDepletedinYears": "19"
    },
    "incometable": {
      "AnnualIncomewithCOLAandIncreasesDecreases": ["45000", "46350", "47741", "49173", "50648", "52167", "53732", "55344", "57005", "58715", "60476", "62291", "64159", "66084", "68067", "70109", "72212", "74378", "76609", "78908", "81275", "83713", "86225", "88811", "91476", "94220", "97047", "99958", "102957", "106045"],
      "CumulativeRetirementIncome": ["45000", "91350", "139091", "188263", "238911", "291078", "344811", "400155", "457160", "515875", "576351", "638641", "702801", "768885", "836951", "907060", "979271", "1053650", "1130259", "1209167", "1290442", "1374155", "1460380", "1549191", "1640667", "1734887", "1831934", "1931892", "2034848", "2140894"]
    },
    "tableHead": [{
      "5years": "After 5 Years"
    }, {
      "10years": "After 10 Years"
    }, {
      "15years": "After 15 Years"
    }, {
      "20years": "After 20 Years"
    }, {
      "25years": "After 25 Years"
    }, {
      "30years": "After 30 Years"
    }],
    "chartData": [{
      "values": [{
        "name": "LowestBalance",
        "value": 575960
      }, {
        "name": "1ValueatRisk",
        "value": 700787
      }, {
        "name": "5ValueatRisk",
        "value": 782667
      }, {
        "name": "10ValueatRisk",
        "value": 828518
      }, {
        "name": "20thPercentileBalance",
        "value": 891534
      }, {
        "name": "40thPercentileBalance",
        "value": 982943
      }, {
        "name": "MedianBalance",
        "value": 1024431
      }, {
        "name": "60thPercentileBalance",
        "value": 1065908
      }, {
        "name": "80thPercentileBalance",
        "value": 1171456
      }],
      "year": "5+ Years"
    }, {
      "values": [{
        "name": "LowestBalance",
        "value": 245545
      }, {
        "name": "1ValueatRisk",
        "value": 516570
      }, {
        "name": "5ValueatRisk",
        "value": 628650
      }, {
        "name": "10ValueatRisk",
        "value": 702171
      }, {
        "name": "20thPercentileBalance",
        "value": 798366
      }, {
        "name": "40thPercentileBalance",
        "value": 937964
      }, {
        "name": "MedianBalance",
        "value": 1005499
      }, {
        "name": "60thPercentileBalance",
        "value": 1069124
      }, {
        "name": "80thPercentileBalance",
        "value": 1251279
      }],
      "year": "10+ Years"
    }, {
      "values": [{
        "name": "LowestBalance",
        "value": 0
      }, {
        "name": "1ValueatRisk",
        "value": 269114
      }, {
        "name": "5ValueatRisk",
        "value": 418722
      }, {
        "name": "10ValueatRisk",
        "value": 513967
      }, {
        "name": "20thPercentileBalance",
        "value": 637609
      }, {
        "name": "40thPercentileBalance",
        "value": 833534
      }, {
        "name": "MedianBalance",
        "value": 925968
      }, {
        "name": "60thPercentileBalance",
        "value": 1027049
      }, {
        "name": "80thPercentileBalance",
        "value": 1285405
      }],
      "year": "15+ Years"
    }, {
      "values": [{
        "name": "LowestBalance",
        "value": 0
      }, {
        "name": "1ValueatRisk",
        "value": 0
      }, {
        "name": "5ValueatRisk",
        "value": 103619
      }, {
        "name": "10ValueatRisk",
        "value": 219344
      }, {
        "name": "20thPercentileBalance",
        "value": 390736
      }, {
        "name": "40thPercentileBalance",
        "value": 645195
      }, {
        "name": "MedianBalance",
        "value": 763857
      }, {
        "name": "60thPercentileBalance",
        "value": 890220
      }, {
        "name": "80thPercentileBalance",
        "value": 1264090
      }],
      "year": "20+ Years"
    }, {
      "values": [{
        "name": "LowestBalance",
        "value": 0
      }, {
        "name": "1ValueatRisk",
        "value": 0
      }, {
        "name": "5ValueatRisk",
        "value": 0
      }, {
        "name": "10ValueatRisk",
        "value": 0
      }, {
        "name": "20thPercentileBalance",
        "value": 0
      }, {
        "name": "40thPercentileBalance",
        "value": 335680
      }, {
        "name": "MedianBalance",
        "value": 482416
      }, {
        "name": "60thPercentileBalance",
        "value": 659515
      }, {
        "name": "80thPercentileBalance",
        "value": 1150991
      }],
      "year": "25+ Years"
    }, {
      "values": [{
        "name": "LowestBalance",
        "value": 0
      }, {
        "name": "1ValueatRisk",
        "value": 0
      }, {
        "name": "5ValueatRisk",
        "value": 0
      }, {
        "name": "10ValueatRisk",
        "value": 0
      }, {
        "name": "20thPercentileBalance",
        "value": 0
      }, {
        "name": "40thPercentileBalance",
        "value": 0
      }, {
        "name": "MedianBalance",
        "value": 38490
      }, {
        "name": "60thPercentileBalance",
        "value": 265548
      }, {
        "name": "80thPercentileBalance",
        "value": 889083
      }],
      "year": "30+ Years"
    }]
  };

  return {
    company: company,
    whiteLabel: whiteLabel,
    savingsInputs: savingsInputs,
    savingsResults: savingsResults,
    spendingInputs: spendingInputs,
    spendingResults: spendingResults
  }
}

module.exports = samplePrintData();
