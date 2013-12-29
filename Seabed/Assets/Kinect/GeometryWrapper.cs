using UnityEngine;
using System.Collections;

public class GeometryWrapper : MonoBehaviour
{
	//线段
	public class Line
	{
		public Vector3 pnt1;
		public Vector3 pnt2;
	}
	public Vector3 geo_LineVector(Line line)
	{
		Vector3 pntVec;
		pntVec.x = line.pnt2.x - line.pnt1.x;
		pntVec.y = line.pnt2.y - line.pnt1.y;
		pntVec.z = line.pnt2.z - line.pnt1.z;
		return pntVec;
	}
	public const int GEO_OK = 0;  		//函数结果正确 
	public const int GEO_CANCEL = 1;	//函数结果错误
	//**************************************************
	//功能 向量的模
	//参数 I:Vector3 vec 向量
	//参数 O:double dblMold 模
	//**************************************************
	public double geo_VectorMold(Vector3 vec1)
	{
		double dblMold = Mathf.Sqrt(vec1.x * vec1.x + vec1.y * vec1.y + vec1.z * vec1.z);
		return dblMold;
	}
	//**************************************************
	//功能 向量的内积
	//参数 I:Vector3 vec1 向量1
	//参数 I:Vector3 vec2 向量2
	//参数 O:double dblAnner 内积
	//**************************************************
	public double geo_2VectorAnner(Vector3 vec1, Vector3 vec2)
	{
		double dblAnner = (vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z);
		return dblAnner;
	}
	//**************************************************
	//功能 向量的夹角
	//参数 I:Vector3 vec1 向量1
	//参数 I:Vector3 vec2 向量2
	//参数 O:double dblangle 角度
	//**************************************************
	public double geo_2VectorAngle(Vector3 vec1, Vector3 vec2)
	{
		int status = 0;
		double dbl2vecAnner = 0.0;
		double dblvec1M = 0.0;
		double dblvec2M = 0.0;

		dblvec1M = geo_VectorMold(vec1);
		dblvec2M = geo_VectorMold(vec2);
		dbl2vecAnner = geo_2VectorAnner(vec1, vec2);
		double dblangle = Mathf.Acos((float)(dbl2vecAnner / (dblvec1M * dblvec2M)));
		return dblangle;
	}
	//**************************************************
	//功能 向量的单位向量
	//参数 I:Vector3 vec1 向量1
	//参数 O:Vector3 vec2 单位向量
	//**************************************************
	public Vector3 geo_VecUnit(Vector3 vec)
	{
		
		Vector3 vecUnit;
		double dblM = geo_VectorMold(vec);
		dblM = Mathf.Abs((float)dblM);
		vecUnit = geo_VecScale(vec,(double) 1/dblM);
		return vecUnit;
	}
	//**************************************************
	//功能 向量的倍数
	//参数 I:Vector3 vec1 向量1
	//参数 I:double	dblScale 倍数
	//参数 O:Vector3 vec2 按倍数变化后的向量
	//**************************************************
	public Vector3 geo_VecScale(Vector3 vec, double dblScale)
	{
		Vector3 vecScale;
		vecScale.x = vec.x * (float)dblScale;
		vecScale.y = vec.y * (float)dblScale;
		vecScale.z = vec.z * (float)dblScale;
		return vecScale;
	}
	// Use this for initialization
	void Start ()
	{
	
	}
	
	// Update is called once per frame
	void Update ()
	{
	
	}
}

