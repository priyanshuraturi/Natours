class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString };
    //BUILD QUERY
    //1)filtering
    const excludedField = ['page', 'sort', 'limit', 'fields'];
    excludedField.forEach((el) => delete queryObj[el]);

    // Advanced Filtering
    //gte : $gte

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(lt|lte|gt|gte)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fields() {
    if (this.queryString.fields) {
      this.query = this.query.select(this.queryString.fields); //Projecting
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  //TODO:

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    this.query = this.query.skip((page - 1) * limit).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
