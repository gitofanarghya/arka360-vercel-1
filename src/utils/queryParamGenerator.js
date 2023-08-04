export function generateQueryParams(params) {

    const queryParams = Object.entries(params)
    .filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== '';
    })
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        const encodedValues = value.map(item => encodeURIComponent(item));
        return `${key}=${encodedValues.join(',')}`;
      }
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');
    console.log({params,queryParams})
    return queryParams
}

