export interface Candidate {
  id: string;
  name: string;
  role: string;
}

export interface RegisterCandidateRequest {
  name: string;
  role: string;
}
