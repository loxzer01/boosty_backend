import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowCampaignModel } from "../../models/FlowCampaign";


interface Request {
  userId: number;
  name: string;
  companyId: number
  flowId: number;
  phrase: string;
}

interface Request {
  userId: number;
  name: string;
  companyId: number
  flowId: number
  phrase: string
}

const CreateFlowCampaignService = async ({
  userId,
  name,
  companyId,
  phrase,
  flowId
}: Request): Promise<FlowCampaignModel> => {
  try {
    const flow = await FlowCampaignModel.create({
      userId: userId,
      companyId: companyId,
      name: name,
      phrase: phrase,
      flowId: flowId
    });

    return flow;
  } catch (error) {
    console.error("Erro ao inserir o usuário:", error);

    return error
  }
};

export default CreateFlowCampaignService;
