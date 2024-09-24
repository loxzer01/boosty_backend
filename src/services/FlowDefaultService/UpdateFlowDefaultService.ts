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
    const flow = await FlowDefaultModel.update(
      { flowIdWelcome, flowIdNotPhrase: flowIdPhrase },
      {
        where: { companyId }
      }
    );
    const flowDefault = await FlowDefaultModel.findOne({
      where: {
        companyId
      }
    });

    for (let item of flowPhrase) {
      if (item.id) {
        await FlowPhraseModel.update(
          {
            phrase: item.phrase,
            phraseId: item.phraseId
          },
          {
            where: {
              companyId,
              id: item.id
            }
          }
        );
      } else {
        await FlowPhraseModel.create({
          phrase: item.phrase,
          phraseId: item.phraseId,
          userId: flowDefault.userId,
          companyId: flowDefault.companyId
        });
      }
    }
    if (flowPhrase.length === 0) {
      await FlowPhraseModel.destroy({
        where: {
          companyId
        }
      });
    }

    return "ok";
  } catch (error) {
    console.error("Erro ao inserir o usuário:", error);

    return error;
  }
};

export default UpdateFlowDefaultService;
