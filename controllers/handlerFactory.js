const catchAsync = require('./../utilis/catchAsync');
const AppError = require('./../utilis/AppError');
const APIFeatures = require('./../utilis/apiFeature');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndRemove(req.params.id);
    if (!doc) {
      return next(
        new AppError(`No document Found With that Id  ${req.params.id}`, 404)
      );
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc: newDoc,
      },
    });
  });
exports.updateOne = (Model) => async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    return next(
      new AppError(`No doc Found With that Id number ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    status: 'succees',
    data: {
      doc: doc,
    },
  });
};

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    // populate option is for if there is anything to populate
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(
          `No document Found With that Id number ${req.params.id}`,
          404
        )
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc: doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // to allow for nested Get reviews on tour(small hack)
    // filter is for getting all the reviews for that tour
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }
    // only till  here nested get reviews
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;
    // .explain is to set the document total query and other stuff in postman
    //const doc = await features.query.explain();
    res.status(200).json({
      status: 'sucess',
      results: doc.length,
      data: {
        doc: doc,
      },
    });
  });
