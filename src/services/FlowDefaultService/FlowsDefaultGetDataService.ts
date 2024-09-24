import User from "../../models/User";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowCampaignModel } from "../../models/FlowCampaign";
import { FlowDefaultModel } from "../../models/FlowDefault";
import { FlowPhraseModel } from "../../models/FlowPhrases";

interface Request {
  companyId: number;
}

interface Response {
  flow: FlowDefaultModel;
  flowPhrase: FlowPhraseModel[] | FlowPhraseModel;
}

const FlowsDefaultGetDataService = async ({
  companyId
}: Request): Promise<Response> => {
  try {
    // Realiza a consulta com paginação usando findAndCountAll
    const { count, rows } = await FlowDefaultModel.findAndCountAll({
      where: {
        companyId: companyId
      }
    });

    const flowPhrase = await FlowPhraseModel.findAll({
      where: {
        companyId: companyId
      }
    });

    const flowResult = [];
    rows.forEach(flow => {
      flowResult.push(flow.toJSON());
    });
    console.log(flowPhrase)
    return {
      flow: flowResult[0],
      flowPhrase
    };
  } catch (error) {
    console.error("Erro ao consultar Fluxo:", error);
  }
};

export default FlowsDefaultGetDataService;
