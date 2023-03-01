export default {
  EXPRESSIONS: {
    observed: '',
    trend: 'STL_Trend',
    seasonal: 'STL_Seasonal',
    residual: 'STL_Residual',
  },

  OPTIONS: [
    {
      value: 'observed',
      translation: 'cao.trendDecomposition.parameters.decomposition.observed',
    },
    {
      value: 'trend',
      translation: 'cao.trendDecomposition.parameters.decomposition.trend',
    },
    {
      value: 'seasonal',
      translation: 'cao.trendDecomposition.parameters.decomposition.seasonal',
    },
    {
      value: 'residual',
      translation: 'cao.trendDecomposition.parameters.decomposition.residual',
    },
  ],
};
