using UnityEngine;
using System.Collections;


public class AI_Controller : MonoBehaviour {
	
	public enum MotionType{
		verticalType,   // 纵向运动类型 例如水母
		transverseType, // 横向运动类型 例如螃蟹
		normalType		// 正常前后运动类型

	}
	
	private enum FishStatus{
		idleStatus,
		followStatus
	}
	public FPSInputController fps;
	public FatherController father;
	public float speed = 1.0f;
	public bool isAttract = true; //是否可被吸引
	public float attractRadius = 10.0f; //可被吸引的半径
	public float smooth = 3.0f;
	public Texture2D lightTexture;      //鱼被吸引后发光的材质
	public Texture2D normalTexture;     //鱼未被吸引的材质
	public GameObject bone;             
	
	private Vector3 distanceToPlayer;             //与玩家的距离
	private float timeToNewDirection = 0.0f;     //转向时间间隔
	private float rotateSpeed = 30.0f;
	private float directionTraveltime = 2.0f;
	private Vector3 storePosition;               //临时存储位置
	private int stopTime = 0;					//停留时间
	private int maxStopTime = 2;				//最大停留时间 2s
	private float pauseAttractTime = 20.0f;			//暂停吸引时间 8s
	
	private Transform player1;					//孩子的位置

	private CharacterController characterController;
	
	private FishStatus status;
	private NavMeshAgent fish;
	
	void Start ()
	{	
		player1 = GameObject.FindGameObjectWithTag("Player").transform;
		fish = GetComponent<NavMeshAgent>();
		fish.enabled = false;
		characterController = GetComponent <CharacterController>();
		
		status = FishStatus.idleStatus;
		
		fish.baseOffset = transform.position.y + 2.6f;//地形差值
	}
	
	void FixedUpdate()
	{
		if (status == FishStatus.idleStatus)
		{
			if (normalTexture != null)
				bone.renderer.material.SetTexture("_MainTex",normalTexture);
			
			
			fish.enabled = false;
			if(Time.time > timeToNewDirection)
			{
				//yield return new WaitForSeconds(1.0f);
				/*
				if(Random.value > 0.5)
					transform.Rotate(new Vector3(0,1,0), rotateSpeed);
				else
					transform.Rotate(new Vector3(0,-1,0), rotateSpeed);*/
				transform.Rotate(new Vector3(Random.value,Random.value,0), rotateSpeed);
			
				timeToNewDirection = Time.time + directionTraveltime;
			}
			
			//Vector3 walkForward = transform.TransformDirection(new Vector3(0,0,-1));
			//characterController.SimpleMove(walkForward * speed);
			transform.Translate(new Vector3(0,0,-1) * Time.deltaTime);
			distanceToPlayer  = transform.position - player1.position;
			
			//Debug.Log(walkForward + "  " + walkForward * speed);
			
			fish.baseOffset = transform.position.y + 2.6f;
			
			//Debug.Log("offset : " + fish.baseOffset);
			
			if (distanceToPlayer.magnitude < attractRadius && isAttract && fps.isCanAttract)
			{
				status = FishStatus.followStatus;
				fps.isCanAttract = false;
				fps.isKinectable = false;
			}
		}
		else if (status == FishStatus.followStatus)
		{
			if (lightTexture != null)
				bone.renderer.material.SetTexture("_MainTex",lightTexture);
			fish.enabled = true;			
			//transform.forward = new Vector3(-transform.forward.x,transform.forward.y,transform.forward.z);
			
			if (Mathf.Abs(transform.position.y - player1.position.y) >= 0.01)
				fish.baseOffset += (player1.position.y - transform.position.y) * Time.deltaTime;
			
			Vector3 position;
			
			position = new Vector3(player1.position.x,
											player1.position.y,
											player1.position.z - 2*player1.localScale.z);	
			
			fish.SetDestination(position);
			
			
			//吃鱼
			
			if(father.blnIsHaving)
			{
				Debug.Log("father is having : " + father.blnIsHaving + ";" + fps.targetPos + "   ;" + player1.position);
				if(fps.targetPos != Vector3.zero && Mathf.Abs(player1.position.x - fps.targetPos.x)<0.01 && Mathf.Abs(player1.position.z - fps.targetPos.z)<0.01)
				{
					Debug.Log("AI destroy");
					Destroy(gameObject);
					//NavMeshAgent player_nav = player1.GetComponent("NavMeshAgent");
					//player_nav.enabled = false;
					fps.isKinectable = true;
					fps.isCanAttract = true;
				}
			}
			
			
			//Debug.Log((player1.position.y - transform.position.y) * Time.deltaTime + "  fish.baseOffset:   " + fish.baseOffset + "fish position:" + transform.position);
			
			if(storePosition != null)
			{
				if(isEqualPosition(transform.position,storePosition))
				{
					stopTime++;
					if(stopTime/100 == maxStopTime)
					{
						status = FishStatus.idleStatus;
						fps.isCanAttract = true;
						fps.isKinectable = true;
						StartCoroutine(waitAttract());
					}
				}
				else
				{
					stopTime = 0;
				}
					
			}
			
			
					
			storePosition = new Vector3(transform.position.x,transform.position.y,transform.position.z);
			
		}
		
	}
	/*
	 * 暂时关闭吸引
	 * 
	 * 
	 * 
	 */
	IEnumerator waitAttract(){
		
		isAttract = false;
		yield return new WaitForSeconds(pauseAttractTime);
		isAttract = true;
	}
	
	bool isEqualPosition(Vector3 pos1,Vector3 pos2){
		
		if (Mathf.Abs(pos1.x - pos2.x) < 0.1f &&
			Mathf.Abs(pos1.y - pos2.y) < 0.1f &&
			Mathf.Abs(pos1.z - pos2.z) < 0.1f)
		{
			return true;
		}
		else
		{
			return false;
		}
		
	}

}
