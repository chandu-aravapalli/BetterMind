from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, Any, Optional, List, Annotated
from datetime import datetime
from bson import ObjectId
from pydantic_core import core_schema

class PyObjectId:
    @classmethod
    def __get_pydantic_core_schema__(
        cls,
        _source_type: Any,
        _handler: Any,
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x),
                return_schema=core_schema.str_schema(),
                when_used='json'
            ),
        )

    @classmethod
    def validate(cls, value: Any) -> ObjectId:
        if isinstance(value, ObjectId):
            return value
        if isinstance(value, str) and ObjectId.is_valid(value):
            return ObjectId(value)
        raise ValueError("Invalid ObjectId")

class MongoBaseModel(BaseModel):
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "_id": "507f1f77bcf86cd799439011"
            }
        }
    )

class StressAssessmentFormData(MongoBaseModel):
    physicalSymptoms: List[str]
    emotionalSymptoms: List[str]
    behavioralSymptoms: List[str]
    stressLevel: int  # 1-10 scale
    stressTriggers: List[str]
    copingStrategies: List[str]
    sleepQuality: int  # 1-5 scale
    exerciseFrequency: int  # 1-7 scale
    dietQuality: int  # 1-5 scale
    socialSupport: int  # 1-5 scale
    workLifeBalance: int  # 1-5 scale
    additionalNotes: Optional[str] = None

class AnxietyAssessmentFormData(MongoBaseModel):
    # GAD-7 questions (0-3 scale for each)
    feelingNervous: int
    notAbleToStopWorrying: int
    worryingTooMuch: int
    troubleRelaxing: int
    beingSoRestless: int
    becomingEasilyAnnoyed: int
    feelingAfraid: int
    totalScore: int
    severity: str
    additionalNotes: Optional[str] = None

class PTSDAssessmentFormData(MongoBaseModel):
    # Criterion B: Re-experiencing
    repeatedMemories: int
    disturbingDreams: int
    relivingExperience: int
    upsetByReminders: int
    physicalReactions: int
    
    # Criterion C: Avoidance
    avoidMemories: int
    avoidExternalReminders: int
    
    # Criterion D: Negative alterations in cognition and mood
    troubleRemembering: int
    negativeBeliefs: int
    blamingSelfOrOthers: int
    negativeFeelings: int
    lossOfInterest: int
    feelingDistant: int
    troublePositiveFeelings: int
    
    # Criterion E: Alterations in arousal and reactivity
    irritableOrAngry: int
    recklessBehavior: int
    hypervigilance: int
    easilyStartled: int
    difficultyConcentrating: int
    troubleSleeping: int
    
    totalScore: int
    criteriaB: bool
    criteriaC: bool
    criteriaD: bool
    criteriaE: bool
    severity: str
    additionalNotes: Optional[str] = None

class AssessmentBase(MongoBaseModel):
    assessmentType: str
    status: str = "pending"
    responses: Dict[str, Any]
    score: Optional[float] = None
    normalizedScore: Optional[float] = None
    severity: Optional[str] = None

class AssessmentCreate(AssessmentBase):
    userId: str

class AssessmentUpdate(MongoBaseModel):
    status: Optional[str] = None
    responses: Optional[Dict[str, Any]] = None
    score: Optional[float] = None
    normalizedScore: Optional[float] = None
    severity: Optional[str] = None
    completedAt: Optional[datetime] = None

class Assessment(AssessmentBase):
    id: Annotated[ObjectId, PyObjectId] = Field(default_factory=ObjectId, alias="_id")
    userId: str
    startedAt: datetime
    completedAt: Optional[datetime] = None

class QuestionBase(MongoBaseModel):
    question_text: str
    question_type: str  # "scale", "text", "multiple_choice"
    options: Optional[List[str]] = None
    required: bool = True
    order: int

class QuestionCreate(QuestionBase):
    pass

class Question(QuestionBase):
    id: Annotated[ObjectId, PyObjectId] = Field(default_factory=ObjectId, alias="_id")

class PreAssessmentFormData(MongoBaseModel):
    consent: str
    mentalHealthDiagnosis: str
    pastChallenges: str
    currentTreatment: str
    previousTherapy: str
    medications: str
    primaryPhysician: str
    insurance: str

class PreAssessmentSubmissionCreate(MongoBaseModel):
    user_id: str
    form_data: PreAssessmentFormData

class PreAssessmentSubmissionDB(PreAssessmentSubmissionCreate):
    id: Annotated[ObjectId, PyObjectId] = Field(default_factory=ObjectId, alias="_id")
    submitted_at: datetime = Field(default_factory=datetime.utcnow)

# Default pre-assessment questions
DEFAULT_QUESTIONS = [
    {
        "question_text": "How would you rate your overall stress level?",
        "question_type": "scale",
        "options": ["1", "2", "3", "4", "5"],
        "required": True,
        "order": 1
    },
    {
        "question_text": "How many hours do you sleep on average?",
        "question_type": "text",
        "required": True,
        "order": 2
    },
    {
        "question_text": "Do you experience anxiety?",
        "question_type": "multiple_choice",
        "options": ["Never", "Sometimes", "Often", "Always"],
        "required": True,
        "order": 3
    },
    {
        "question_text": "How would you describe your mood lately?",
        "question_type": "multiple_choice",
        "options": ["Very Happy", "Happy", "Neutral", "Sad", "Very Sad"],
        "required": True,
        "order": 4
    }
] 