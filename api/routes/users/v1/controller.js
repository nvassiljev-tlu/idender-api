//Vastutab HTTP-päringutele vastamise ees,Kutsutakse  ja saadetakse vastus kliendile.
const createResponse = require('../../../middlewares/createResponse');

class UsersController { // loome uue klassi
  constructor(service) { //võtab vastu teenuse
    this.service = service; // salvestab selle teenuse klassi sisse et saaks seda kasutada teistes meetodites
  }

  list = async (req, res) => { //funktsioon kasutajate nimekirja saamiseks
    const users = await this.service.getAll();// kutsub kõik kasutajad
    res.status(200).json(createResponse(200, users)); // tagastab JSON vastuse kliendile
  };

  get = async (req, res) => { //võtab ühe kasutaja ID alusel
    const user = await this.service.getById(req.params.id); // loeb kasutaja ID URL'is
    if (!user) return res.status(404).json(createResponse(404, {}, { message: "Not found" })); // kui ei leita, tagastab 404
    res.status(200).json(createResponse(200, user));
  };

  update = async (req, res) => { //uuendab kasutaja andmeid
    const updated = await this.service.update(req.params.id, req.body); //uued andmed, mida saata req.body
    res.status(200).json(createResponse(200, updated));
  };

  activate = async (req, res) => { //Aktiveerib kasutaja
    const result = await this.service.setActive(req.params.id, true);
    res.status(200).json(createResponse(200, result));
  };

  deactivate = async (req, res) => {//Deaktiveerib kasutaja 
    const result = await this.service.setActive(req.params.id, false);
    res.status(200).json(createResponse(200, result));
  };

  assignScopes = async (req, res) => { //Lisab kasutajale õigused
    const result = await this.service.assignScopes(req.params.id, req.body.scopeIds);
    res.status(200).json(createResponse(200, result));
  };

  getIdeas = async (req, res) => { //Tagastab kasutaja loodud ideed
    const ideas = await this.service.getIdeasByUser(req.params.id);
    res.status(200).json(createResponse(200, ideas));
  };
  

  
}


module.exports = UsersController;