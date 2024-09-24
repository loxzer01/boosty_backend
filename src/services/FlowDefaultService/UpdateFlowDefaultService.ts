import { FlowBuilderModel } from "../../models/FlowBuilder";
import { FlowCampaignModel } from "../../models/FlowCampaign";
import { FlowDefaultModel } from "../../models/FlowDefault";
import { FlowPhraseModel } from "../../models/FlowPhrases";

interface Request {
  companyId: number;
  flowIdWelcome: number;
  flowIdPhrase: number;
  flowPhrase:
    | {
        phraseId: number;
        phrase: string;
        id?: number;
      }[]
    | [];
}

const UpdateFlowDefaultService = async ({
  companyId,
  flowIdWelcome,
  flowIdPhrase,
  flowPhrase
}: Request): Promise<String> => {
  try {
    const flowDefault = await FlowDefaultModel.findOne({
      where: {
        companyId
      }
    });

    for (let item of flowPhrase) {
      await FlowPhraseModel.destroy({
        where: {
          companyId
        }
      });
      await FlowPhraseModel.create({
        phrase: item.phrase,
        phraseId: item.phraseId,
        userId: flowDefault.userId,
        companyId: flowDefault.companyId
      });
    }
    const flow = await FlowDefaultModel.update(
      { flowIdWelcome, flowIdNotPhrase: flowIdPhrase },
      {
        where: { companyId }
      }
    );

    return "ok";
  } catch (error) {
    console.error("Erro ao inserir o usuário:", error);

    return error;
  }
};

export default UpdateFlowDefaultService;
