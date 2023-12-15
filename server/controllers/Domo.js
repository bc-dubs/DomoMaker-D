const models = require('../models');

const { Domo } = models;

const makerPage = async (req, res) => {
  res.render('app');
};

const getDomos = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Domo.find(query).sort({ priority: 1 }).select('name age priority favorite').lean()
      .exec();

    return res.json({ domos: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving domos!' });
  }
};

const makeDomo = async (req, res) => {
  // If missing domo parameters, throw error
  if (!req.body.name || !req.body.age) {
    return res.status(400).json({ error: 'Both name and age are required!' });
  }

  let numDomos;

  try {
    const query = { owner: req.session.account._id };
    numDomos = (await Domo.find(query).lean().exec()).length;
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error in domo list!' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    owner: req.session.account._id,
    priority: numDomos,
  };

  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.status(201).json({ name: newDomo.name, age: newDomo.age });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Domo already exists!' });
    }
    return res.status(500).json({ error: 'An error occured making domo!' });
  }
};

// Swaps two adjacent domos
const swapDomos = async (req, res) => {
  if (!(req.body.upper || req.body.upper === 0)) { // the priority value of the upper domo
    return res.status(400).json({ error: 'Domos to move not specified' });
  }

  const upperPriority = parseInt(req.body.upper, 10);

  try {
    const query = { owner: req.session.account._id };
    const domoList = await Domo.find(query).sort({ priority: 1 }).select('priority').lean()
      .exec();

    if (upperPriority > domoList.length - 2 || upperPriority < 0) {
      return res.status(400).json({ error: 'Specified domo cannot move' });
    }

    const upperUpdate = { priority: upperPriority + 1 };
    const lowerUpdate = { priority: upperPriority };
    const upperDomo = await Domo.findByIdAndUpdate(domoList[upperPriority]._id, upperUpdate);
    await Domo.findByIdAndUpdate(domoList[upperPriority + 1]._id, lowerUpdate);
    return res.status(201).json({ name: upperDomo.name, age: upperDomo.age });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error moving domos!' });
  }
};

const updateDomoPriority = async (id, priority) => {
  await Domo.findByIdAndUpdate(id, { priority });
};

// Deletes a specified domo
const deleteDomo = async (req, res) => {
  if (!req.body._id) { // the priority value of the upper domo
    return res.status(400).json({ error: 'Domo to delete not specified' });
  }

  try {
    const targetDomo = await Domo.findById(req.body._id);

    const query = { owner: req.session.account._id };
    const domoList = await Domo.find(query).sort({ priority: 1 }).select('priority').lean()
      .exec();

    if (targetDomo.priority > domoList.length - 1 || targetDomo.priority < 0) {
      return res.status(400).json({ error: 'Invalid deletion index' });
    }

    for (let i = targetDomo.priority + 1; i < domoList.length; i++) {
      updateDomoPriority(domoList[i]._id, i - 1);
    }

    await Domo.findByIdAndDelete(req.body._id);

    return res.status(201).json({ name: targetDomo.name, age: targetDomo.age });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error deleting domos!' });
  }
};

const toggleFave = async (req, res) => {
  if (!req.body._id) { // the priority value of the upper domo
    return res.status(400).json({ error: 'Domo to favorite not specified' });
  }

  try {
    const targetDomo = await Domo.findById(req.body._id);
    const updatedDomo = await Domo.findByIdAndUpdate(
      req.body._id,
      { favorite: !targetDomo.favorite },
    );
    return res.status(201).json({ name: updatedDomo.name, age: updatedDomo.age });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error favoriting domo!' });
  }
};

module.exports = {
  makerPage,
  makeDomo,
  getDomos,
  swapDomos,
  deleteDomo,
  toggleFave,
};
